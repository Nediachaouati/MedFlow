import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  Avatar,
  CircularProgress,
  Alert,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";

export default function PatientDashboard() {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userMsg = { text: prompt, isUser: true };
    setMessages(prev => [...prev, userMsg]);
    const currentPrompt = prompt;
    setPrompt("");
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ prompt: currentPrompt, sessionId }),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setMessages(prev => [...prev, { text: data.result, isUser: false }]);
      setSessionId(data.sessionId);
    } catch (err) {
      setError("Le chatbot est temporairement indisponible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f4f6f9", fontFamily: '"Poppins", sans-serif',pt: "80px", }}>
      <Box sx={{ flex: 1, ml: { xs: 0 }, p: { xs: 2, md: 4 }, background: "linear-gradient(180deg, #f8faff, #eef2f6)" }}>
        <Box sx={{ maxWidth: 780, mx: "auto" }}>

          {/* Intro */}
          <Box sx={{ textAlign: "center", background: "linear-gradient(135deg, #e3f2fd, #f3e5f5)", py: 3.5, borderRadius: 5, mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#1976d2" }}>
              CareConnect
            </Typography>
            <Typography sx={{ mt: 1, color: "#555", fontSize: 15.5 }}>
              Votre assistant médical intelligent
            </Typography>
          </Box>

          {/* Chat Container */}
          <Paper elevation={10} sx={{ borderRadius: 4, overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.15)" }}>

            {/* Messages */}
            <Box sx={{ height: { xs: 100, md: 180 }, overflowY: "auto", p: 1.5, backgroundColor: "#f9fafc" }}>
              <List sx={{ py: 0 }}>
                {messages.length === 0 && (
                  <Typography textAlign="center" color="text.secondary" sx={{ mt: 6, fontSize: 14.5 }}>
                    Posez votre question
                  </Typography>
                )}
                {messages.map((msg, i) => (
                  <ListItem key={i} sx={{ justifyContent: msg.isUser ? "flex-end" : "flex-start", mb: 1, px: 0 }}>
                    <Box sx={{ display: "flex", flexDirection: msg.isUser ? "row-reverse" : "row", alignItems: "flex-end", gap: 1, maxWidth: "80%" }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: msg.isUser ? "#007bff" : "#9c27b0" }}>
                        {msg.isUser ? <PersonIcon fontSize="small" /> : <SmartToyIcon fontSize="small" />}
                      </Avatar>
                      <Paper sx={{
                        p: 1.3,
                        borderRadius: 2.5,
                        bgcolor: msg.isUser ? "#007bff" : "#e8ebf0",
                        color: msg.isUser ? "white" : "#333",
                        borderBottomLeftRadius: msg.isUser ? 14 : 4,
                        borderBottomRightRadius: msg.isUser ? 4 : 14,
                      }}>
                        <Typography sx={{ fontSize: 14.8, lineHeight: 1.4 }}>
                          {msg.text}
                        </Typography>
                      </Paper>
                    </Box>
                  </ListItem>
                ))}
                {loading && (
                  <ListItem>
                    <CircularProgress size={20} sx={{ ml: 4 }} />
                    <Typography sx={{ ml: 1, color: "#666", fontSize: 14 }}>Réflexion...</Typography>
                  </ListItem>
                )}
              </List>
            </Box>

            {/* zone de saisie */}
            <Box sx={{ p: 1, pb: 1.5, borderTop: "1px solid #eee", bgcolor: "#fff" }}>
              <form onSubmit={sendMessage}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <TextField
                    fullWidth
                    size="small"
                    variant="outlined"
                    placeholder="Posez votre question..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={loading}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "24px",
                        bgcolor: "#f5f5f5",
                        fontSize: 15,
                        py: 0.1,
                        height: 42,
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !prompt.trim()}
                    sx={{
                      minWidth: 42,
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      bgcolor: "#1976d2",
                      "&:hover": { bgcolor: "#1565c0" },
                      p: 0,
                    }}
                  >
                    <SendIcon fontSize="small" />
                  </Button>
                </Box>
              </form>
              {error && <Alert severity="error" sx={{ mt: 1, py: 0.5, fontSize: 13 }}>{error}</Alert>}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}