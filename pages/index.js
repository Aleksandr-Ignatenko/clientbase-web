// Импортируем хуки React и клиент Supabase
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css';

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
  { code: "+376", country: "Andorra", iso: "AD" },
  { code: "+244", country: "Angola", iso: "AO" },
  { code: "+1268", country: "Antigua and Barbuda", iso: "AG" },
  { code: "+54", country: "Argentina", iso: "AR" },
  { code: "+374", country: "Armenia", iso: "AM" },
  { code: "+297", country: "Aruba", iso: "AW" },
  { code: "+61", country: "Australia", iso: "AU" },
  { code: "+43", country: "Austria", iso: "AT" },
  { code: "+994", country: "Azerbaijan", iso: "AZ" },
  { code: "+1242", country: "Bahamas", iso: "BS" },
  { code: "+973", country: "Bahrain", iso: "BH" },
  { code: "+880", country: "Bangladesh", iso: "BD" },
  { code: "+1246", country: "Barbados", iso: "BB" },
  { code: "+375", country: "Belarus", iso: "BY" },
  { code: "+32", country: "Belgium", iso: "BE" },
  { code: "+501", country: "Belize", iso: "BZ" },
  { code: "+229", country: "Benin", iso: "BJ" },
  { code: "+975", country: "Bhutan", iso: "BT" },
  { code: "+591", country: "Bolivia", iso: "BO" },
  { code: "+387", country: "Bosnia and Herzegovina", iso: "BA" },
  { code: "+267", country: "Botswana", iso: "BW" },
  { code: "+55", country: "Brazil", iso: "BR" },
  { code: "+673", country: "Brunei", iso: "BN" },
  { code: "+359", country: "Bulgaria", iso: "BG" },
  { code: "+226", country: "Burkina Faso", iso: "BF" },
  { code: "+257", country: "Burundi", iso: "BI" },
  { code: "+855", country: "Cambodia", iso: "KH" },
  { code: "+237", country: "Cameroon", iso: "CM" },
  { code: "+1", country: "Canada", iso: "CA" },
  { code: "+238", country: "Cape Verde", iso: "CV" },
  { code: "+1345", country: "Cayman Islands", iso: "KY" },
  { code: "+236", country: "Central African Republic", iso: "CF" },
  { code: "+56", country: "Chile", iso: "CL" },
  { code: "+86", country: "China", iso: "CN" },
  { code: "+57", country: "Colombia", iso: "CO" },
  { code: "+269", country: "Comoros", iso: "KM" },
  { code: "+242", country: "Congo", iso: "CG" },
  { code: "+682", country: "Cook Islands", iso: "CK" },
  { code: "+506", country: "Costa Rica", iso: "CR" },
  { code: "+385", country: "Croatia", iso: "HR" },
  { code: "+53", country: "Cuba", iso: "CU" },
  { code: "+357", country: "Cyprus", iso: "CY" },
  { code: "+420", country: "Czech Republic", iso: "CZ" },
  { code: "+45", country: "Denmark", iso: "DK" },
  { code: "+253", country: "Djibouti", iso: "DJ" },
  { code: "+1767", country: "Dominica", iso: "DM" },
  { code: "+1809", country: "Dominican Republic", iso: "DO" },
  { code: "+593", country: "Ecuador", iso: "EC" },
  { code: "+20", country: "Egypt", iso: "EG" },
  { code: "+503", country: "El Salvador", iso: "SV" },
  { code: "+240", country: "Equatorial Guinea", iso: "GQ" },
  { code: "+291", country: "Eritrea", iso: "ER" },
  { code: "+372", country: "Estonia", iso: "EE" },
  { code: "+251", country: "Ethiopia", iso: "ET" },
  { code: "+679", country: "Fiji", iso: "FJ" },
  { code: "+358", country: "Finland", iso: "FI" },
  { code: "+33", country: "France", iso: "FR" },
  { code: "+995", country: "Georgia", iso: "GE" },
  { code: "+49", country: "Germany", iso: "DE" },
  { code: "+233", country: "Ghana", iso: "GH" },
  { code: "+30", country: "Greece", iso: "GR" },
  { code: "+1473", country: "Grenada", iso: "GD" },
  { code: "+502", country: "Guatemala", iso: "GT" },
  { code: "+224", country: "Guinea", iso: "GN" },
  { code: "+245", country: "Guinea-Bissau", iso: "GW" },
  { code: "+592", country: "Guyana", iso: "GY" },
  { code: "+509", country: "Haiti", iso: "HT" },
  { code: "+504", country: "Honduras", iso: "HN" },
  { code: "+852", country: "Hong Kong", iso: "HK" },
  { code: "+36", country: "Hungary", iso: "HU" },
  { code: "+354", country: "Iceland", iso: "IS" },
  { code: "+91", country: "India", iso: "IN" },
  { code: "+62", country: "Indonesia", iso: "ID" },
  { code: "+98", country: "Iran", iso: "IR" },
  { code: "+964", country: "Iraq", iso: "IQ" },
  { code: "+353", country: "Ireland", iso: "IE" },
  { code: "+972", country: "Israel", iso: "IL" },
  { code: "+39", country: "Italy", iso: "IT" },
  { code: "+225", country: "Ivory Coast", iso: "CI" },
  { code: "+1876", country: "Jamaica", iso: "JM" },
  { code: "+81", country: "Japan", iso: "JP" },
  { code: "+962", country: "Jordan", iso: "JO" },
  { code: "+77", country: "Kazakhstan", iso: "KZ" },
  { code: "+254", country: "Kenya", iso: "KE" },
  { code: "+686", country: "Kiribati", iso: "KI" },
  { code: "+383", country: "Kosovo", iso: "XK" },
  { code: "+965", country: "Kuwait", iso: "KW" },
  { code: "+996", country: "Kyrgyzstan", iso: "KG" },
  { code: "+856", country: "Laos", iso: "LA" },
  { code: "+371", country: "Latvia", iso: "LV" },
  { code: "+961", country: "Lebanon", iso: "LB" },
  { code: "+266", country: "Lesotho", iso: "LS" },
  { code: "+231", country: "Liberia", iso: "LR" },
  { code: "+218", country: "Libya", iso: "LY" },
  { code: "+423", country: "Liechtenstein", iso: "LI" },
  { code: "+370", country: "Lithuania", iso: "LT" },
  { code: "+352", country: "Luxembourg", iso: "LU" },
  { code: "+853", country: "Macao", iso: "MO" },
  { code: "+389", country: "North Macedonia", iso: "MK" },
  { code: "+261", country: "Madagascar", iso: "MG" },
  { code: "+265", country: "Malawi", iso: "MW" },
  { code: "+60", country: "Malaysia", iso: "MY" },
  { code: "+960", country: "Maldives", iso: "MV" },
  { code: "+223", country: "Mali", iso: "ML" },
  { code: "+356", country: "Malta", iso: "MT" },
  { code: "+692", country: "Marshall Islands", iso: "MH" },
  { code: "+596", country: "Martinique", iso: "MQ" },
  { code: "+222", country: "Mauritania", iso: "MR" },
  { code: "+230", country: "Mauritius", iso: "MU" },
  { code: "+52", country: "Mexico", iso: "MX" },
  { code: "+691", country: "Micronesia", iso: "FM" },
  { code: "+373", country: "Moldova", iso: "MD" },
  { code: "+377", country: "Monaco", iso: "MC" },
  { code: "+976", country: "Mongolia", iso: "MN" },
  { code: "+382", country: "Montenegro", iso: "ME" },
  { code: "+212", country: "Morocco", iso: "MA" },
  { code: "+258", country: "Mozambique", iso: "MZ" },
  { code: "+95", country: "Myanmar", iso: "MM" },
  { code: "+264", country: "Namibia", iso: "NA" },
  { code: "+674", country: "Nauru", iso: "NR" },
  { code: "+977", country: "Nepal", iso: "NP" },
  { code: "+31", country: "Netherlands", iso: "NL" },
  { code: "+64", country: "New Zealand", iso: "NZ" },
  { code: "+505", country: "Nicaragua", iso: "NI" },
  { code: "+227", country: "Niger", iso: "NE" },
  { code: "+234", country: "Nigeria", iso: "NG" },
  { code: "+850", country: "North Korea", iso: "KP" },
  { code: "+47", country: "Norway", iso: "NO" },
  { code: "+968", country: "Oman", iso: "OM" },
  { code: "+92", country: "Pakistan", iso: "PK" },
  { code: "+680", country: "Palau", iso: "PW" },
  { code: "+970", country: "Palestine", iso: "PS" },
  { code: "+507", country: "Panama", iso: "PA" },
  { code: "+675", country: "Papua New Guinea", iso: "PG" },
  { code: "+595", country: "Paraguay", iso: "PY" },
  { code: "+51", country: "Peru", iso: "PE" },
  { code: "+63", country: "Philippines", iso: "PH" },
  { code: "+48", country: "Poland", iso: "PL" },
  { code: "+351", country: "Portugal", iso: "PT" },
  { code: "+974", country: "Qatar", iso: "QA" },
  { code: "+40", country: "Romania", iso: "RO" },
  { code: "+7", country: "Russia", iso: "RU" },
  { code: "+250", country: "Rwanda", iso: "RW" },
  { code: "+966", country: "Saudi Arabia", iso: "SA" },
  { code: "+221", country: "Senegal", iso: "SN" },
  { code: "+381", country: "Serbia", iso: "RS" },
  { code: "+248", country: "Seychelles", iso: "SC" },
  { code: "+232", country: "Sierra Leone", iso: "SL" },
  { code: "+65", country: "Singapore", iso: "SG" },
  { code: "+421", country: "Slovakia", iso: "SK" },
  { code: "+386", country: "Slovenia", iso: "SI" },
  { code: "+677", country: "Solomon Islands", iso: "SB" },
  { code: "+252", country: "Somalia", iso: "SO" },
  { code: "+27", country: "South Africa", iso: "ZA" },
  { code: "+82", country: "South Korea", iso: "KR" },
  { code: "+34", country: "Spain", iso: "ES" },
  { code: "+94", country: "Sri Lanka", iso: "LK" },
  { code: "+249", country: "Sudan", iso: "SD" },
  { code: "+597", country: "Suriname", iso: "SR" },
  { code: "+268", country: "Eswatini", iso: "SZ" },
  { code: "+46", country: "Sweden", iso: "SE" },
  { code: "+41", country: "Switzerland", iso: "CH" },
  { code: "+963", country: "Syria", iso: "SY" },
  { code: "+886", country: "Taiwan", iso: "TW" },
  { code: "+992", country: "Tajikistan", iso: "TJ" },
  { code: "+255", country: "Tanzania", iso: "TZ" },
  { code: "+66", country: "Thailand", iso: "TH" },
  { code: "+228", country: "Togo", iso: "TG" },
  { code: "+676", country: "Tonga", iso: "TO" },
  { code: "+216", country: "Tunisia", iso: "TN" },
  { code: "+90", country: "Turkey", iso: "TR" },
  { code: "+993", country: "Turkmenistan", iso: "TM" },
  { code: "+688", country: "Tuvalu", iso: "TV" },
  { code: "+256", country: "Uganda", iso: "UG" },
  { code: "+380", country: "Ukraine", iso: "UA" },
  { code: "+971", country: "United Arab Emirates", iso: "AE" },
  { code: "+44", country: "United Kingdom", iso: "GB" },
  { code: "+1", country: "United States", iso: "US" },
  { code: "+598", country: "Uruguay", iso: "UY" },
  { code: "+998", country: "Uzbekistan", iso: "UZ" },
  { code: "+678", country: "Vanuatu", iso: "VU" },
  { code: "+379", country: "Vatican", iso: "VA" },
  { code: "+58", country: "Venezuela", iso: "VE" },
  { code: "+84", country: "Vietnam", iso: "VN" },
  { code: "+260", country: "Zambia", iso: "ZM" },
  { code: "+263", country: "Zimbabwe", iso: "ZW" }
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
        <option key={c.code} value={c.code} data-iso={c.iso}>
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
