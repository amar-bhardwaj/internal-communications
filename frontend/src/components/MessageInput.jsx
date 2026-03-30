import { useState } from "react";
import socket from "../services/socket";
import API from "../services/api";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const departmentId = localStorage.getItem("department");
  const userName = localStorage.getItem("userName");

  const sendMessage = async () => {
    try {
      let fileUrl = "";

      // ✅ Upload file if exists
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await API.post("/upload", formData);
        fileUrl = res.data.fileUrl;
      }

      // ✅ Send message
      await API.post("/messages/send", {
        text,
        department: departmentId,
        fileUrl
      });

      // Reset
      setText("");
      setFile(null);

    } catch (err) {
      console.error("Send error");
    }
  };

  const handleTyping = (e) => {
    setText(e.target.value);

    socket.emit("typing", {
      departmentId,
      name: userName
    });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  return (
    <div className="inputBox">
      
      {/* Preview */}
      {file && (
        <div className="filePreview">
          <p>Selected: {file.name}</p>

          {file.type.startsWith("image/") && (
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              width="100"
            />
          )}
        </div>
      )}

      <input
        value={text}
        onChange={handleTyping}
        placeholder="Type a message..."
      />

      <input type="file" onChange={handleFileChange} />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default MessageInput;