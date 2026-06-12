import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import json
import os
import pickle

# ====================== CONFIG ======================
DATA_INDEX_FILE = "data-index.json"
SETTINGS_FILE = "last_session.pkl"
KJV_TEXT_FILE = "kjv.json"

class BibleCommandCreator:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Bible Command JSON Creator")
        self.root.geometry("1150x820")

        self.export_folder = tk.StringVar(value=os.getcwd())
        self.current_book = tk.StringVar()
        self.current_chapter = tk.IntVar(value=1)
        self.current_verse = tk.IntVar(value=1)

        self.kjv = {}
        self.load_settings()
        self.load_kjv_data()
        self.build_gui()
        self.load_current_verse()

    def load_settings(self):
        if os.path.exists(SETTINGS_FILE):
            try:
                with open(SETTINGS_FILE, "rb") as f:
                    data = pickle.load(f)
                    self.export_folder.set(data.get("export_folder", os.getcwd()))
                    self.current_book.set(data.get("book", "Genesis"))
                    self.current_chapter.set(data.get("chapter", 1))
                    self.current_verse.set(data.get("verse", 1))
            except:
                pass

    def save_settings(self):
        data = {
            "export_folder": self.export_folder.get(),
            "book": self.current_book.get(),
            "chapter": self.current_chapter.get(),
            "verse": self.current_verse.get()
        }
        with open(SETTINGS_FILE, "wb") as f:
            pickle.dump(data, f)

    def load_kjv_data(self):
        try:
            with open(KJV_TEXT_FILE, encoding="utf-8") as f:
                self.kjv = json.load(f)
            print(f"✅ Successfully loaded {KJV_TEXT_FILE}")
        except Exception as e:
            messagebox.showwarning("KJV File Missing", 
                f"Could not load {KJV_TEXT_FILE}.\nError: {e}\n\nI'll show placeholder text.")
            self.kjv = {}

    def build_gui(self):
        # Top bar
        top = tk.Frame(self.root)
        top.pack(fill="x", padx=10, pady=8)

        tk.Label(top, text="Book:").pack(side="left")
        books = sorted(self.kjv.keys()) if self.kjv else ["Genesis", "Exodus", "Matthew", "Revelation"]
        self.book_combo = ttk.Combobox(top, textvariable=self.current_book, values=books, width=22, state="readonly")
        self.book_combo.pack(side="left", padx=(5, 15))

        tk.Label(top, text="Chapter:").pack(side="left")
        self.chapter_spin = tk.Spinbox(top, from_=1, to=150, width=6, textvariable=self.current_chapter, command=self.load_current_verse)
        self.chapter_spin.pack(side="left", padx=(5, 15))

        tk.Label(top, text="Verse:").pack(side="left")
        self.verse_spin = tk.Spinbox(top, from_=1, to=176, width=6, textvariable=self.current_verse, command=self.load_current_verse)
        self.verse_spin.pack(side="left", padx=(5, 20))

        tk.Button(top, text="Choose Export Folder", command=self.choose_folder).pack(side="right")
        tk.Label(top, textvariable=self.export_folder, fg="gray").pack(side="right", padx=10)

        self.status_label = tk.Label(top, text="○", font=("Arial", 18, "bold"), fg="gray")
        self.status_label.pack(side="right", padx=15)

        # Verse Display
        verse_frame = tk.LabelFrame(self.root, text="KJV Verse Text", padx=10, pady=8)
        verse_frame.pack(fill="x", padx=10, pady=5)
        self.verse_text = tk.Text(verse_frame, height=7, wrap="word", font=("Georgia", 11))
        self.verse_text.pack(fill="x", padx=5)

        # Form Fields
        form = tk.Frame(self.root)
        form.pack(fill="both", expand=True, padx=10, pady=10)

        self.entries = {}

        fields = [
            ("id", "ID (auto-generated)"),
            ("reference", "Reference"),
            ("verse_text", "Verse Text (editable)"),
            ("instruction", "Instruction *"),
            ("command_type", "Command Type"),
            ("command_giver", "Command Giver"),
            ("command_receiver", "Command Receiver"),
            ("testament", "Testament"),
            ("covenant", "Covenant"),
            ("applicable_today", "Applicable Today"),
            ("applicable_to", "Applicable To (comma separated)"),
            ("category", "Category (comma separated)"),
            ("things_to_do", "Things To Do"),
            ("things_not_to_do", "Things Not To Do"),
            ("notes", "Notes")
        ]

        for i, (key, label) in enumerate(fields):
            tk.Label(form, text=label + ":").grid(row=i, column=0, sticky="e", pady=4, padx=5)
            
            if key in ["applicable_today", "things_to_do", "things_not_to_do"]:
                var = tk.BooleanVar()
                cb = tk.Checkbutton(form, variable=var)
                cb.grid(row=i, column=1, sticky="w")
                self.entries[key] = var
            else:
                entry = tk.Entry(form, width=65)
                entry.grid(row=i, column=1, sticky="w", pady=4, padx=5)
                self.entries[key] = entry

        # Bottom Buttons
        btn_frame = tk.Frame(self.root)
        btn_frame.pack(fill="x", padx=10, pady=12)

        tk.Button(btn_frame, text="← Previous Verse", width=14, command=self.prev_verse).pack(side="left", padx=5)
        tk.Button(btn_frame, text="No Command Here", bg="#f44336", fg="white", font=("Arial", 10, "bold"),
                  command=self.no_command_mode).pack(side="left", padx=5)
        tk.Button(btn_frame, text="Save JSON", bg="#4CAF50", fg="white", font=("Arial", 10, "bold"),
                  command=self.save_json).pack(side="left", padx=5)
        tk.Button(btn_frame, text="Next Verse →", bg="#2196F3", fg="white", font=("Arial", 10, "bold"),
                  command=self.next_verse).pack(side="right", padx=5)

        # Populate books
        self.book_combo['values'] = books
        self.book_combo.bind("<<ComboboxSelected>>", lambda e: self.load_current_verse())

        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

    def no_command_mode(self):
        """Quick fill for verses with no command"""
        self.entries["instruction"].delete(0, tk.END)
        self.entries["instruction"].insert(0, "No command in this verse")

        for field in ["command_type", "command_giver", "command_receiver", "covenant", "applicable_to", "category", "notes"]:
            if field in self.entries:
                self.entries[field].delete(0, tk.END)

        self.entries["applicable_today"].set(False)
        self.entries["things_to_do"].set(False)
        self.entries["things_not_to_do"].set(False)

        messagebox.showinfo("No Command Mode", "Form filled with 'No Command' defaults.\nYou can still edit before saving.")

    def choose_folder(self):
        folder = filedialog.askdirectory(initialdir=self.export_folder.get())
        if folder:
            self.export_folder.set(folder)

    def get_current_id(self):
        book = self.current_book.get()[:3].upper()
        return f"{book}-{self.current_chapter.get():03d}-{self.current_verse.get():03d}"

    def load_current_verse(self):
        book = self.current_book.get()
        ch = str(self.current_chapter.get())
        vs = str(self.current_verse.get())

        text = "Verse text not found"
        if book in self.kjv and ch in self.kjv[book] and vs in self.kjv[book][ch]:
            text = self.kjv[book][ch][vs]

        self.verse_text.delete("1.0", tk.END)
        self.verse_text.insert(tk.END, text)

        ref = f"{book} {ch}:{vs}"
        self.entries["reference"].delete(0, tk.END)
        self.entries["reference"].insert(0, ref)

        self.entries["id"].delete(0, tk.END)
        self.entries["id"].insert(0, self.get_current_id())

        self.entries["testament"].delete(0, tk.END)
        self.entries["testament"].insert(0, "Old Testament" if book in 
            ["Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
             "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra",
             "Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon",
             "Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos",
             "Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi"]
            else "New Testament")

        self.check_if_exists()

    def check_if_exists(self):
        base_id = self.get_current_id()
        exists = False
        for letter in [""] + [chr(i) for i in range(ord('a'), ord('z')+1)]:
            filename = f"{base_id}{letter}.json"
            if os.path.exists(os.path.join(self.export_folder.get(), filename)):
                exists = True
                break
        self.status_label.config(fg="green" if exists else "gray", text="✓" if exists else "○")

    def save_json(self):
        base_id = self.get_current_id()
        folder = self.export_folder.get()

        letter = ""
        counter = 0
        while True:
            filename = f"{base_id}{letter}.json"
            path = os.path.join(folder, filename)
            if not os.path.exists(path):
                break
            counter += 1
            letter = chr(ord('a') + counter - 1)

        data = {
            "id": base_id + letter,
            "book": self.current_book.get(),
            "chapter": self.current_chapter.get(),
            "verse": self.current_verse.get(),
            "reference": self.entries["reference"].get(),
            "verse_text": self.verse_text.get("1.0", tk.END).strip(),
            "instruction": self.entries["instruction"].get(),
            "command_type": self.entries["command_type"].get(),
            "command_giver": self.entries["command_giver"].get(),
            "command_receiver": self.entries["command_receiver"].get(),
            "testament": self.entries["testament"].get(),
            "covenant": self.entries["covenant"].get() or None,
            "applicable_today": self.entries["applicable_today"].get(),
            "applicable_to": [x.strip() for x in self.entries["applicable_to"].get().split(",") if x.strip()],
            "category": [x.strip() for x in self.entries["category"].get().split(",") if x.strip()],
            "things_to_do": self.entries["things_to_do"].get(),
            "things_not_to_do": self.entries["things_not_to_do"].get(),
            "person_to_emulate": None,
            "person_not_to_emulate": None,
            "notes": self.entries["notes"].get() or ""
        }

        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        self.update_data_index(filename)
        messagebox.showinfo("Saved", f"Saved as: {filename}")
        self.check_if_exists()

    def update_data_index(self, new_filename):
        path = os.path.join(self.export_folder.get(), DATA_INDEX_FILE)
        files = []
        if os.path.exists(path):
            try:
                with open(path) as f:
                    files = json.load(f)
            except:
                files = []
        
        if new_filename not in files:
            files.append(new_filename)
            files.sort()
            with open(path, "w") as f:
                json.dump(files, f, indent=2)

    def next_verse(self):
        self.save_settings()
        self.current_verse.set(self.current_verse.get() + 1)
        self.load_current_verse()

    def prev_verse(self):
        if self.current_verse.get() > 1:
            self.save_settings()
            self.current_verse.set(self.current_verse.get() - 1)
            self.load_current_verse()

    def on_close(self):
        self.save_settings()
        self.root.destroy()


if __name__ == "__main__":
    app = BibleCommandCreator()
    app.root.mainloop()