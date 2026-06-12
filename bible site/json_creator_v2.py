
# BibleCommandCreator_v2.py
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import json
import os
import pickle

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_INDEX_FILE = os.path.join(SCRIPT_DIR, "data-index.json")
SETTINGS_FILE = os.path.join(SCRIPT_DIR, "last_session.pkl")
KJV_TEXT_FILE = os.path.join(SCRIPT_DIR, "kjv.json")

OT_BOOKS = {
    "Genesis","Exodus","Leviticus","Numbers","Deuteronomy","Joshua","Judges","Ruth",
    "1 Samuel","2 Samuel","1 Kings","2 Kings","1 Chronicles","2 Chronicles","Ezra",
    "Nehemiah","Esther","Job","Psalms","Proverbs","Ecclesiastes","Song of Solomon",
    "Isaiah","Jeremiah","Lamentations","Ezekiel","Daniel","Hosea","Joel","Amos",
    "Obadiah","Jonah","Micah","Nahum","Habakkuk","Zephaniah","Haggai","Zechariah","Malachi"
}

class BibleCommandCreator:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Bible Command JSON Creator")
        self.root.geometry("920x820")

        self.export_folder = tk.StringVar(value=os.getcwd())
        self.current_book = tk.StringVar(value="Genesis")
        self.current_chapter = tk.IntVar(value=1)
        self.current_verse = tk.IntVar(value=1)
        self.overwrite_existing = tk.BooleanVar(value=False)

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
                self.overwrite_existing.set(data.get("overwrite_existing", False))
            except Exception:
                pass

    def save_settings(self):
        with open(SETTINGS_FILE, "wb") as f:
            pickle.dump({
                "export_folder": self.export_folder.get(),
                "book": self.current_book.get(),
                "chapter": self.current_chapter.get(),
                "verse": self.current_verse.get(),
                "overwrite_existing": self.overwrite_existing.get()
            }, f)

    def load_kjv_data(self):
        try:
            with open(KJV_TEXT_FILE, encoding="utf-8") as f:
                self.kjv = json.load(f)
        except Exception as e:
            messagebox.showwarning("KJV File Missing", f"Could not load {KJV_TEXT_FILE}\n\n{e}")
            self.kjv = {}

    def build_gui(self):
        top = tk.Frame(self.root)
        top.pack(fill="x", padx=10, pady=8)

        books = sorted(self.kjv.keys()) if self.kjv else ["Genesis"]

        tk.Label(top, text="Book:").pack(side="left")
        self.book_combo = ttk.Combobox(top, textvariable=self.current_book, values=books, width=20, state="readonly")
        self.book_combo.pack(side="left")

        tk.Label(top, text="Chapter:").pack(side="left", padx=(10,0))
        tk.Spinbox(top, from_=1, to=150, width=6, textvariable=self.current_chapter, command=self.load_current_verse).pack(side="left")

        tk.Label(top, text="Verse:").pack(side="left", padx=(10,0))
        tk.Spinbox(top, from_=1, to=176, width=6, textvariable=self.current_verse, command=self.load_current_verse).pack(side="left")

        self.status_label = tk.Label(top, text="○", font=("Arial",18,"bold"))
        self.status_label.pack(side="right", padx=10)

        tk.Checkbutton(top, text="Overwrite Existing", variable=self.overwrite_existing).pack(side="right", padx=10)
        tk.Button(top, text="Choose Export Folder", command=self.choose_folder).pack(side="right")

        verse_frame = tk.LabelFrame(self.root, text="KJV Verse Text")
        verse_frame.pack(fill="x", padx=10, pady=5)

        self.verse_text = tk.Text(verse_frame, height=7, wrap="word", font=("Georgia",16))
        self.verse_text.pack(fill="x", padx=5, pady=5)

        form = tk.Frame(self.root)
        form.pack(fill="both", expand=True, padx=10, pady=10)

        self.entries = {}

        fields = [
            ("id","ID"),
            ("reference","Reference"),
            ("verse_text","Verse Text (editable)"),
            ("instruction","Instruction"),
            ("command_type","Command Type"),
            ("command_giver","Command Giver"),
            ("command_receiver","Command Receiver"),
            ("testament","Testament"),
            ("covenant","Covenant"),
            ("applicable_today","Applicable Today"),
            ("applicable_to","Applicable To"),
            ("category","Category"),
            ("things_to_do","Things To Do"),
            ("things_not_to_do","Things Not To Do"),
            ("notes","Notes")
        ]

        for r,(key,label) in enumerate(fields):
            tk.Label(form,text=label+":").grid(row=r,column=0,sticky="e")

            if key in ["applicable_today","things_to_do","things_not_to_do"]:
                var=tk.BooleanVar()
                tk.Checkbutton(form,variable=var).grid(row=r,column=1,sticky="w")
                self.entries[key]=var
            elif key=="command_type":
                cb=ttk.Combobox(form,state="readonly",width=60,
                    values=["","direct_command","implied_command"])
                cb.grid(row=r,column=1,sticky="w")
                self.entries[key]=cb
            elif key=="covenant":
                cb=ttk.Combobox(form,state="readonly",width=60,
                    values=["","Edenic","Adamic","Noahic","Abrahamic",
                            "Palestinian/Land","Mosaic","Davidic","New Covenant"])
                cb.grid(row=r,column=1,sticky="w")
                self.entries[key]=cb
            else:
                e=tk.Entry(form,width=65)
                e.grid(row=r,column=1,sticky="w")
                self.entries[key]=e

        btn = tk.Frame(self.root)
        btn.pack(fill="x", padx=10, pady=10)

        big = {"width":18,"height":2,"font":("Arial",11,"bold")}

        tk.Button(btn,text="← Previous Verse",command=self.prev_verse,**big).pack(side="left",padx=5)
        tk.Button(btn,text="No Command Here",command=self.no_command_mode,bg="#f44336",fg="white",**big).pack(side="left",padx=5)
        tk.Button(btn,text="Save JSON",command=self.save_json,bg="#4CAF50",fg="white",**big).pack(side="left",padx=5)
        tk.Button(btn,text="Next Verse →",command=self.next_verse,bg="#2196F3",fg="white",**big).pack(side="right",padx=5)

        self.book_combo.bind("<<ComboboxSelected>>", lambda e:self.load_current_verse())

    def choose_folder(self):
        folder = filedialog.askdirectory(initialdir=self.export_folder.get())
        if folder:
            self.export_folder.set(folder)
            self.load_current_verse()

    def get_current_id(self):
        return f"{self.current_book.get()[:3].upper()}-{self.current_chapter.get():03d}-{self.current_verse.get():03d}"

    def find_existing_file(self):
        folder=self.export_folder.get()
        if not os.path.isdir(folder):
            return None
        for f in os.listdir(folder):
            if not f.lower().endswith(".json"):
                continue
            try:
                with open(os.path.join(folder,f),encoding="utf-8") as h:
                    d=json.load(h)
                if d.get("book")==self.current_book.get() and d.get("chapter")==self.current_chapter.get() and d.get("verse")==self.current_verse.get():
                    return os.path.join(folder,f)
            except Exception:
                pass
        return None

    def load_existing_record(self,path):
        with open(path,encoding="utf-8") as f:
            d=json.load(f)

        for k,v in self.entries.items():
            if k not in d:
                continue
            if isinstance(v, tk.BooleanVar):
                v.set(bool(d.get(k)))
            else:
                v.delete(0,tk.END)
                value=d.get(k)
                if isinstance(value,list):
                    value=", ".join(value)
                if value is None:
                    value=""
                v.insert(0,str(value))

    def load_current_verse(self):
        book=self.current_book.get()
        ch=str(self.current_chapter.get())
        vs=str(self.current_verse.get())

        text="Verse text not found"
        if book in self.kjv and ch in self.kjv[book] and vs in self.kjv[book][ch]:
            text=self.kjv[book][ch][vs]

        self.verse_text.delete("1.0",tk.END)
        self.verse_text.insert(tk.END,text)

        for field,val in {
            "reference":f"{book} {ch}:{vs}",
            "id":self.get_current_id(),
            "verse_text":text,
            "testament":"Old Testament" if book in OT_BOOKS else "New Testament"
        }.items():
            self.entries[field].delete(0,tk.END)
            self.entries[field].insert(0,val)

        existing=self.find_existing_file()
        if existing:
            self.status_label.config(text="✓",fg="green")
            self.load_existing_record(existing)
        else:
            self.status_label.config(text="○",fg="gray")

    def no_command_mode(self):
        self.entries["instruction"].delete(0, tk.END)
        self.entries["instruction"].insert(0, "No command in this verse")

        # Clear dropdowns
        self.entries["command_type"].set("")
        self.entries["covenant"].set("")

        # Clear fields
        for field in [
            "command_giver",
            "command_receiver",
            "notes",
            "category",
            "applicable_to"
        ]:
            self.entries[field].delete(0, tk.END)

        # Uncheck boxes
        self.entries["applicable_today"].set(False)
        self.entries["things_to_do"].set(False)
        self.entries["things_not_to_do"].set(False)

        #messagebox.showinfo(
        #    "No Command Mode",
        #    "Form filled with 'No Command' defaults."
        #)

    def save_json(self):
        base=self.get_current_id()
        folder=self.export_folder.get()

        if self.overwrite_existing.get():
            filename=f"{base}.json"
        else:
            letter=""
            n=0
            while True:
                filename=f"{base}{letter}.json"
                if not os.path.exists(os.path.join(folder,filename)):
                    break
                n+=1
                letter=chr(ord("a")+n-1)

        path=os.path.join(folder,filename)

        data={
            "id": os.path.splitext(filename)[0],
            "book": self.current_book.get(),
            "chapter": self.current_chapter.get(),
            "verse": self.current_verse.get(),
            "reference": self.entries["reference"].get(),
            "verse_text": self.verse_text.get("1.0","end").strip(),
            "instruction": self.entries["instruction"].get(),
            "command_type": self.entries["command_type"].get() or None,
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
            "notes": self.entries["notes"].get()
        }

        with open(path,"w",encoding="utf-8") as f:
            json.dump(data,f,indent=2,ensure_ascii=False)

        messagebox.showinfo("Saved", f"Saved as {filename}")
        self.load_current_verse()

    def next_verse(self):
        self.current_verse.set(self.current_verse.get()+1)
        self.load_current_verse()

    def prev_verse(self):
        if self.current_verse.get()>1:
            self.current_verse.set(self.current_verse.get()-1)
            self.load_current_verse()

if __name__=="__main__":
    app=BibleCommandCreator()
    app.root.mainloop()
