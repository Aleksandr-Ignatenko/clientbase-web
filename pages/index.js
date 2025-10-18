// Импортируем хуки React и клиент Supabase
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

// Подключаем Supabase с помощью переменных окружения
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Главный компонент CRM
export default function CRM() {
  // --- Состояния ---
  const [session, setSession] = useState(null);
    // Список клиентов
  const [clients, setClients] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Форма клиента
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    countryCode: "+7",
    phone: "",
    company: "",
    notes: "",
  });

  // --- Список телефонных кодов ---
  const countryCodes = [
    { code: "+1", country: "🇺🇸 США/Канада" },
    { code: "+7", country: "🇷🇺 Россия/Казахстан" },
    { code: "+44", country: "🇬🇧 Великобритания" },
    { code: "+49", country: "🇩🇪 Германия" },
    { code: "+33", country: "🇫🇷 Франция" },
    { code: "+39", country: "🇮🇹 Италия" },
    { code: "+34", country: "🇪🇸 Испания" },
    { code: "+81", country: "🇯🇵 Япония" },
    { code: "+86", country: "🇨🇳 Китай" },
    { code: "+91", country: "🇮🇳 Индия" },
    { code: "+55", country: "🇧🇷 Бразилия" },
    { code: "+61", country: "🇦🇺 Австралия" },
    { code: "+598", country: "🇺🇾 Уругвай" },
    { code: "+380", country: "🇺🇦 Украина" },
    { code: "+375", country: "🇧🇾 Беларусь" },
    { code: "+994", country: "🇦🇿 Азербайджан" },
    { code: "+996", country: "🇰🇬 Кыргызстан" },
    { code: "+998", country: "🇺🇿 Узбекистан" },
    { code: "+90", country: "🇹🇷 Турция" },
    { code: "+971", country: "🇦🇪 ОАЭ" },
    // можно дополнить до полного списка ISO при желании
  ];

  // --- Проверка сессии ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  // --- Загрузка клиентов ---
  useEffect(() => {
    if (session) fetchClients();
  }, [session]);

  async function fetchClients() {
    const { data, error } = await supabase
      .from("CRM")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (error) console.error("Ошибка при загрузке:", error);
    else setClients(data);
  }

  // === Добавление или обновление клиента ===
  async function saveClient() {
    if (!form.full_name.trim()) {
      alert("Поле 'Имя клиента' обязательно");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) {
      alert("Введите корректный email");
      return;
    }

        // Проверка телефона: только цифры
    const phoneRegex = /^[0-9]*$/;
    if (!phoneRegex.test(form.phone)) {
      alert("Телефон должен содержать только цифры");
      return;
    }

        // Собираем полный номер телефона
    const fullPhone =
      form.phone.length > 0 ? `${form.countryCode}${form.phone}` : "";

    setLoading(true);

    let error;
    if (editingId) {
      ({ error } = await supabase
        .from("CRM")
        .update({
          full_name: form.full_name,
          email: form.email,
          phone: fullPhone,
          company: form.company,
          notes: form.notes,
        })
        .eq("id", editingId)
        .eq("user_id", session.user.id));
    } else {
      ({ error } = await supabase.from("CRM").insert([
        {
          user_id: session.user.id,
          full_name: form.full_name,
          email: form.email,
          phone: fullPhone,
          company: form.company,
          notes: form.notes,
        },
      ]));
    }

    setLoading(false);

    if (error) alert("Ошибка: " + error.message);
    else {
      resetForm();
      fetchClients();
    }
  }

  // === Редактирование клиента ===
  function editClient(client) {
    setForm({
      full_name: client.full_name || "",
      email: client.email || "",
      countryCode: client.phone ? client.phone.match(/^\+\d+/)?.[0] || "+7" : "+7",
      phone: client.phone ? client.phone.replace(/^\+\d+/, "") : "",
      company: client.company || "",
      notes: client.notes || "",
    });
    setEditingId(client.id);
  }

  // === Удаление клиента ===
  async function deleteClient(id) {
    if (!confirm("Удалить клиента?")) return;
    const { error } = await supabase
      .from("CRM")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);
    if (error) alert("Ошибка: " + error.message);
    else fetchClients();
  }

  // === Разлогин ===
  async function logout() {
    await supabase.auth.signOut();
    setSession(null);
  }

  // === Очистка формы ===
  function resetForm() {
    setForm({
      full_name: "",
      email: "",
      countryCode: "+7",
      phone: "",
      company: "",
      notes: "",
    });
    setEditingId(null);
  }

  // === Интерфейс ===
  if (!session)
  return (
    <div style={{ maxWidth: 400, margin: "80px auto", textAlign: "center" }}>
      <h2>🔐 Вход в CRM</h2>
      <p style={{ marginBottom: 20 }}>
        Войдите с помощью email — ссылка для входа придёт на почту.
      </p>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={[]}
        magicLink
      />
    </div>
  );

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        maxWidth: 900,
        margin: "40px auto",
        background: "#f5f5f5",
        padding: 20,
        borderRadius: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>CRM — Клиенты</h1>
        <button onClick={logout}>Выйти</button>
      </div>

      {/* === ФОРМА ДОБАВЛЕНИЯ === */}
      <div style={{ marginBottom: 30, display: "flex", flexDirection: "column", gap: 8 }}>
        <input
          placeholder="Имя клиента *"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <select
            style={{ width: "150px" }}
            value={form.countryCode}
            onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
          >
            {countryCodes.map((c) => (
              <option key={c.code} value={c.code}>
                {c.country} ({c.code})
              </option>
            ))}
          </select>
          <input
            placeholder="Телефон"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value.replace(/\D/g, ""),
              })
            }
          />
        </div>
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
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={saveClient} disabled={loading}>
            {loading ? "Сохранение..." : editingId ? "Сохранить изменения" : "Добавить клиента"}
          </button>
          {editingId && <button onClick={resetForm}>Отмена</button>}
        </div>
      </div>

      {/* === СПИСОК КЛИЕНТОВ === */}
      <table border="1" cellPadding="6" style={{ width: "100%", background: "white" }}>
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
          {clients.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                Нет клиентов
              </td>
            </tr>
          ) : (
            clients.map((c) => (
              <tr key={c.id}>
                <td>{c.full_name}</td>
                <td>{c.email}</td>
                <td>{c.phone}</td>
                <td>{c.company}</td>
                <td>{c.notes}</td>
                <td>
                  <button onClick={() => editClient(c)}>✏️</button>{" "}
                  <button onClick={() => deleteClient(c.id)}>🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
