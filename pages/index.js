// Импортируем хуки React и клиент Supabase
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Подключаем Supabase с помощью переменных окружения
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Главный компонент CRM
export default function CRM() {
  // Список клиентов
  const [clients, setClients] = useState([]);

  // Состояние формы
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    countryCode: "+7", // по умолчанию Россия
    phone: "",
    company: "",
    notes: "",
  });

  // Флаг загрузки при добавлении клиента
  const [loading, setLoading] = useState(false);

  // Загрузка клиентов при загрузке страницы
  useEffect(() => {
    fetchClients();
  }, []);

  // === Загрузка клиентов из Supabase ===
  async function fetchClients() {
    const { data, error } = await supabase
      .from("CRM")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Ошибка при загрузке:", error);
    else setClients(data);
  }

  // === Добавление клиента ===
  async function addClient() {
    // Проверка email на корректность
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) {
      alert("Введите корректный email");
      return;
    }

    // Проверка телефона: только цифры
    const phoneRegex = /^[0-9]+$/;
    if (!phoneRegex.test(form.phone)) {
      alert("Телефон должен содержать только цифры");
      return;
    }

    // Собираем полный номер телефона
    const fullPhone = `${form.countryCode}${form.phone}`;

    setLoading(true);

    // Добавляем клиента в Supabase
    const { error } = await supabase.from("CRM").insert([
      {
        full_name: form.full_name,
        email: form.email,
        phone: fullPhone,
        company: form.company,
        notes: form.notes,
      },
    ]);

    setLoading(false);

    if (error) {
      alert("Ошибка при добавлении: " + error.message);
    } else {
      // Очищаем форму
      setForm({
        full_name: "",
        email: "",
        countryCode: "+7",
        phone: "",
        company: "",
        notes: "",
      });
      fetchClients(); // обновляем список
    }
  }

  // === Удаление клиента ===
  async function deleteClient(id) {
    if (!confirm("Удалить этого клиента?")) return;
    const { error } = await supabase.from("CRM").delete().eq("id", id);
    if (error) alert("Ошибка при удалении: " + error.message);
    else fetchClients();
  }

  // === Рендер интерфейса ===
  return (
    <div
      style={{
        fontFamily: "sans-serif",
        maxWidth: 800,
        margin: "40px auto",
        background: "#f5f5f5",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <h1 style={{ textAlign: "center" }}>CRM — Клиенты</h1>

      {/* === ФОРМА ДОБАВЛЕНИЯ === */}
      <div
        style={{
          marginBottom: 30,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {/* Имя клиента */}
        <input
          placeholder="Имя клиента"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />

        {/* Email с проверкой при потере фокуса */}
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          onBlur={() => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (form.email && !emailRegex.test(form.email)) {
              alert("Введите корректный email");
            }
          }}
        />

        {/* Телефон + выбор кода страны */}
        <div style={{ display: "flex", gap: "8px" }}>
          <select
            style={{ width: "90px" }}
            value={form.countryCode}
            onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
          >
            <option value="+1">🇺🇸 +1</option>
            <option value="+7">🇷🇺 +7</option>
            <option value="+598">🇺🇾 +598</option>
            <option value="+44">🇬🇧 +44</option>
            <option value="+49">🇩🇪 +49</option>
          </select>

          <input
            placeholder="Телефон"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value.replace(/\D/g, ""), // удаляем нецифровые символы
              })
            }
          />
        </div>

        {/* Компания */}
        <input
          placeholder="Компания"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />

        {/* Заметки */}
        <input
          placeholder="Заметки"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />

        {/* Кнопка добавления */}
        <button onClick={addClient} disabled={loading}>
          {loading ? "Добавление..." : "Добавить клиента"}
        </button>
      </div>

      {/* === ТАБЛИЦА КЛИЕНТОВ === */}
      <table
        border="1"
        cellPadding="6"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          backgroundColor: "white",
        }}
      >
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
              <td colSpan="6" style={{ textAlign: "center" }}>
                Нет клиентов
              </td>
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

      {/* Кнопка обновления */}
      <button
        style={{
          marginTop: 20,
          display: "block",
          marginLeft: "auto",
          marginRight: "auto",
        }}
        onClick={fetchClients}
      >
        Обновить список
      </button>
    </div>
  );
}
