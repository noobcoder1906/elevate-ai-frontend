import React, { useState, useEffect } from "react";
import "./log.css";
import Navbar from "../Navbar/Navbar";

const Log = ({ onNotesUpdate }) => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const storedNotes = sessionStorage.getItem("logs");
    if (storedNotes) {
      setNotes(JSON.parse(storedNotes));
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem("logs", JSON.stringify(notes));
  }, [notes]);

  const handleAddNewNote = () => {
    setNewNote({ title: "", content: "" });
    setIsAdding(true);
    setSelectedNote(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNote((prevNote) => ({
      ...prevNote,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    const newEntry = {
      title: newNote.title,
      content: newNote.content,
      date: new Date().toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };

    const updatedNotes = [newEntry, ...notes];
    setNotes(updatedNotes);
    setNewNote({ title: "", content: "" });
    setIsAdding(false);
    setSelectedNote(newEntry);

    sessionStorage.setItem("logs", JSON.stringify(updatedNotes));

    if (onNotesUpdate) {
      onNotesUpdate(updatedNotes);
    }
  };

  return (
    <>
      <Navbar />
      <div className="journal-container">
        <div className="sidebar">
          <button className="add-note-btn" onClick={handleAddNewNote}>
            ➕ Add Note
          </button>
          {notes.length === 0 ? (
            <p className="empty">No notes available. Add a new note!</p>
          ) : (
            <ul className="note-list">
              {notes.map((note, index) => (
                <li
                  key={index}
                  className={`note-item ${selectedNote === note ? "active" : ""}`}
                  onClick={() => setSelectedNote(note)}
                >
                  <h3>{note.title}</h3>
                  <p className="note-date">{note.date}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="note-content-area">
          {isAdding ? (
            <div className="editor new-note-form">
              <input
                type="text"
                name="title"
                placeholder="Enter note title..."
                value={newNote.title}
                onChange={handleInputChange}
              />
              <textarea
                name="content"
                placeholder="Write your journal entry here..."
                value={newNote.content}
                onChange={handleInputChange}
              ></textarea>
              <button className="submit-btn" onClick={handleSubmit}>
                Save Note
              </button>
            </div>
          ) : selectedNote ? (
            <div className="view-note">
              <h2>{selectedNote.title}</h2>
              <p className="note-date">{selectedNote.date}</p>
              <textarea
                className="note-textarea"
                value={selectedNote.content}
                readOnly
              ></textarea>
            </div>
          ) : (
            <h2 className="placeholder">Select a note or create a new one</h2>
          )}
        </div>
      </div>
    </>
  );
};

export default Log;
