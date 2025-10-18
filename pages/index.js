import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function CRM() {
  const [clients, setClients] = useState([]);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  // Загрузка клиентов из базы
  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    const { data, error } = await supabase.from("CRM").select("*").order("created_at", { ascending: false });
    if (error) console.error("Ошибка при загрузке:", error);
    else setClients(data);
  }

  async function addClient() {
    setLoading(true);
    const { error } = await supabase.from("CRM").insert([form]);
    setLoading(false);
    if (error) alert("Ошибка при добавлении: " + error.message);
    else {
      setForm({ full_name: "", email: "", phone: "", company: "", notes: "" });
      fetchClients();
    }
  }

  async function deleteClient(id) {
    if (!confirm("Удалить этого клиента?")) return;
    const { error } = await supabase.from("CRM").delete().eq("id", id);
    if (error) alert("Ошибка при удалении: " + error.message);
    else fetchClients();
  }

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 800, margin: "40px auto" }}>
      <h1>CRM — Клиенты</h1>

      <div style={{ marginBottom: 30 }}>
        <input
          placeholder="Имя клиента"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          placeholder="Телефон"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          placeholder="Компания"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />
        <input
          placeholder="Заметки"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <button onClick={addClient} disabled={loading}>
          {loading ? "Добавление..." : "Добавить клиента"}
        </button>
      </div>

      <table border="1" cellPadding="6" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Имя</th>
            <th>Email</th>
            <th>Телефон</th>
            <th>Компания</th>
            <th>Заметки</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {clients.length === 0 && (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>Нет клиентов</td>
            </tr>
          )}
          {clients.map((c) => (
            <tr key={c.id}>
              <td>{c.full_name}</td>
              <td>{c.email}</td>
              <td>{c.phone}</td>
              <td>{c.company}</td>
              <td>{c.notes}</td>
              <td>
                <button onClick={() => deleteClient(c.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button style={{ marginTop: 20 }} onClick={fetchClients}>
        Обновить список
      </button>
    </div>
  );
}
