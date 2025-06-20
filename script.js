 import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

      const supabase = createClient(
        "https://wdejpctwefotdilrytbb.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWpwY3R3ZWZvdGRpbHJ5dGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MzI5MTMsImV4cCI6MjA2NjAwODkxM30.GIKwoLfKfdGNSKG1O29gY3OMHfYDhzZacLyqjE-xh50"
      );

      const form = document.getElementById("diaryForm");
      const namaInput = document.getElementById("nama");
      const isiInput = document.getElementById("isi");
      const notesList = document.getElementById("notesList");

      let editingId = null;

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nama = namaInput.value.trim();
        const isi = isiInput.value.trim();
        if (!nama || !isi) return;

        if (editingId) {
          const { error } = await supabase
            .from("diary")
            .update({ nama, isi })
            .eq("id", editingId);
          if (error) return alert("Gagal memperbarui: " + error.message);
          editingId = null;
          form.querySelector("button").textContent = "🚀 Simpan Catatan";
        } else {
          const { error } = await supabase.from("diary").insert([{ nama, isi }]);
          if (error) return alert("Gagal menyimpan: " + error.message);
        }

        form.reset();
        loadNotes();
      });

      async function loadNotes() {
        const { data, error } = await supabase
          .from("diary")
          .select("*, created_at")
          .order("created_at", { ascending: false });
        if (error) return alert("Gagal memuat data: " + error.message);
        renderNotes(data);
      }

      function renderNotes(data) {
        notesList.innerHTML =
          '<h2 class="text-xl font-bold text-gray-700">📂 Catatan Sebelumnya</h2>';

        data.forEach((note) => {
          const card = document.createElement("div");
          card.className =
            "bg-white shadow-md rounded-xl p-6 relative hover:shadow-lg transition";
          const tanggal = new Date(note.created_at).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
          card.innerHTML = `
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg font-semibold">${note.nama}</h3>
                <p class="text-sm text-gray-400">${tanggal}</p>
              </div>
              <div class="flex gap-2">
                <button data-id="${note.id}" class="editBtn text-sm px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition">Edit</button>
                <button data-id="${note.id}" class="deleteBtn text-sm px-3 py-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition">Hapus</button>
              </div>
            </div>
            <p class="mt-4 text-gray-700 leading-relaxed whitespace-pre-line">${note.isi}</p>
          `;
          notesList.appendChild(card);
        });

        document.querySelectorAll(".editBtn").forEach((btn) =>
          btn.addEventListener("click", handleEdit)
        );
        document.querySelectorAll(".deleteBtn").forEach((btn) =>
          btn.addEventListener("click", handleDelete)
        );
      }

      async function handleEdit(e) {
        const id = e.target.dataset.id;
        const { data, error } = await supabase
          .from("diary")
          .select("*")
          .eq("id", id)
          .single();
        if (error) return alert("Gagal mengambil catatan: " + error.message);

        namaInput.value = data.nama;
        isiInput.value = data.isi;
        editingId = id;
        form.querySelector("button").textContent = "💾 Update Catatan";
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      async function handleDelete(e) {
        const id = e.target.dataset.id;
        if (!confirm("Hapus catatan ini?")) return;
        const { error } = await supabase.from("diary").delete().eq("id", id);
        if (error) return alert("Gagal menghapus: " + error.message);
        loadNotes();
      }

      loadNotes();