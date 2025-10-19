// Импортируем хуки React и клиент Supabase
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css';

// --- Функция для конвертации ISO-кода (например "RU") в emoji-флаг ---
function getFlagEmoji(isoCode) {
  if (!isoCode || isoCode.length !== 2) return "";
  // Преобразуем буквы в рег. индикаторные символы
  const codePoints = [...isoCode.toUpperCase()].map(c => 127397 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

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
  { code: "+237", country: "🇨🇲 Cameroon" },
  { code: "+1", country: "🇨🇦 Canada" },
  { code: "+238", country: "🇨🇻 Cape Verde" },
  { code: "+1345", country: "🇰🇾 Cayman Islands" },
  { code: "+236", country: "🇨🇫 Central African Republic" },
  { code: "+56", country: "🇨🇱 Chile" },
  { code: "+86", country: "🇨🇳 China" },
  { code: "+57", country: "🇨🇴 Colombia" },
  { code: "+269", country: "🇰🇲 Comoros" },
  { code: "+242", country: "🇨🇬 Congo" },
  { code: "+682", country: "🇨🇰 Cook Islands" },
  { code: "+506", country: "🇨🇷 Costa Rica" },
  { code: "+385", country: "🇭🇷 Croatia" },
  { code: "+53", country: "🇨🇺 Cuba" },
  { code: "+357", country: "🇨🇾 Cyprus" },
  { code: "+420", country: "🇨🇿 Czech Republic" },
  { code: "+45", country: "🇩🇰 Denmark" },
  { code: "+253", country: "🇩🇯 Djibouti" },
  { code: "+1767", country: "🇩🇲 Dominica" },
  { code: "+1809", country: "🇩🇴 Dominican Republic" },
  { code: "+593", country: "🇪🇨 Ecuador" },
  { code: "+20", country: "🇪🇬 Egypt" },
  { code: "+503", country: "🇸🇻 El Salvador" },
  { code: "+240", country: "🇬🇶 Equatorial Guinea" },
  { code: "+291", country: "🇪🇷 Eritrea" },
  { code: "+372", country: "🇪🇪 Estonia" },
  { code: "+251", country: "🇪🇹 Ethiopia" },
  { code: "+679", country: "🇫🇯 Fiji" },
  { code: "+358", country: "🇫🇮 Finland" },
  { code: "+33", country: "🇫🇷 France" },
  { code: "+995", country: "🇬🇪 Georgia" },
  { code: "+49", country: "🇩🇪 Germany" },
  { code: "+233", country: "🇬🇭 Ghana" },
  { code: "+30", country: "🇬🇷 Greece" },
  { code: "+1473", country: "🇬🇩 Grenada" },
  { code: "+502", country: "🇬🇹 Guatemala" },
  { code: "+224", country: "🇬🇳 Guinea" },
  { code: "+245", country: "🇬🇼 Guinea-Bissau" },
  { code: "+592", country: "🇬🇾 Guyana" },
  { code: "+509", country: "🇭🇹 Haiti" },
  { code: "+504", country: "🇭🇳 Honduras" },
  { code: "+852", country: "🇭🇰 Hong Kong" },
  { code: "+36", country: "🇭🇺 Hungary" },
  { code: "+354", country: "🇮🇸 Iceland" },
  { code: "+91", country: "🇮🇳 India" },
  { code: "+62", country: "🇮🇩 Indonesia" },
  { code: "+98", country: "🇮🇷 Iran" },
  { code: "+964", country: "🇮🇶 Iraq" },
  { code: "+353", country: "🇮🇪 Ireland" },
  { code: "+972", country: "🇮🇱 Israel" },
  { code: "+39", country: "🇮🇹 Italy" },
  { code: "+225", country: "🇨🇮 Ivory Coast" },
  { code: "+1876", country: "🇯🇲 Jamaica" },
  { code: "+81", country: "🇯🇵 Japan" },
  { code: "+962", country: "🇯🇴 Jordan" },
  { code: "+77", country: "🇰🇿 Kazakhstan" },
  { code: "+254", country: "🇰🇪 Kenya" },
  { code: "+686", country: "🇰🇮 Kiribati" },
  { code: "+383", country: "🇽🇰 Kosovo" },
  { code: "+965", country: "🇰🇼 Kuwait" },
  { code: "+996", country: "🇰🇬 Kyrgyzstan" },
  { code: "+856", country: "🇱🇦 Laos" },
  { code: "+371", country: "🇱🇻 Latvia" },
  { code: "+961", country: "🇱🇧 Lebanon" },
  { code: "+266", country: "🇱🇸 Lesotho" },
  { code: "+231", country: "🇱🇷 Liberia" },
  { code: "+218", country: "🇱🇾 Libya" },
  { code: "+423", country: "🇱🇮 Liechtenstein" },
  { code: "+370", country: "🇱🇹 Lithuania" },
  { code: "+352", country: "🇱🇺 Luxembourg" },
  { code: "+853", country: "🇲🇴 Macao" },
  { code: "+389", country: "🇲🇰 North Macedonia" },
  { code: "+261", country: "🇲🇬 Madagascar" },
  { code: "+265", country: "🇲🇼 Malawi" },
  { code: "+60", country: "🇲🇾 Malaysia" },
  { code: "+960", country: "🇲🇻 Maldives" },
  { code: "+223", country: "🇲🇱 Mali" },
  { code: "+356", country: "🇲🇹 Malta" },
  { code: "+692", country: "🇲🇭 Marshall Islands" },
  { code: "+596", country: "🇲🇶 Martinique" },
  { code: "+222", country: "🇲🇷 Mauritania" },
  { code: "+230", country: "🇲🇺 Mauritius" },
  { code: "+52", country: "🇲🇽 Mexico" },
  { code: "+691", country: "🇫🇲 Micronesia" },
  { code: "+373", country: "🇲🇩 Moldova" },
  { code: "+377", country: "🇲🇨 Monaco" },
  { code: "+976", country: "🇲🇳 Mongolia" },
  { code: "+382", country: "🇲🇪 Montenegro" },
  { code: "+212", country: "🇲🇦 Morocco" },
  { code: "+258", country: "🇲🇿 Mozambique" },
  { code: "+95", country: "🇲🇲 Myanmar" },
  { code: "+264", country: "🇳🇦 Namibia" },
  { code: "+674", country: "🇳🇷 Nauru" },
  { code: "+977", country: "🇳🇵 Nepal" },
  { code: "+31", country: "🇳🇱 Netherlands" },
  { code: "+64", country: "🇳🇿 New Zealand" },
  { code: "+505", country: "🇳🇮 Nicaragua" },
  { code: "+227", country: "🇳🇪 Niger" },
  { code: "+234", country: "🇳🇬 Nigeria" },
  { code: "+850", country: "🇰🇵 North Korea" },
  { code: "+47", country: "🇳🇴 Norway" },
  { code: "+968", country: "🇴🇲 Oman" },
  { code: "+92", country: "🇵🇰 Pakistan" },
  { code: "+680", country: "🇵🇼 Palau" },
  { code: "+970", country: "🇵🇸 Palestine" },
  { code: "+507", country: "🇵🇦 Panama" },
  { code: "+675", country: "🇵🇬 Papua New Guinea" },
  { code: "+595", country: "🇵🇾 Paraguay" },
  { code: "+51", country: "🇵🇪 Peru" },
  { code: "+63", country: "🇵🇭 Philippines" },
  { code: "+48", country: "🇵🇱 Poland" },
  { code: "+351", country: "🇵🇹 Portugal" },
  { code: "+974", country: "🇶🇦 Qatar" },
  { code: "+40", country: "🇷🇴 Romania" },
  { code: "+7", country: "🇷🇺 Russia" },
  { code: "+250", country: "🇷🇼 Rwanda" },
  { code: "+966", country: "🇸🇦 Saudi Arabia" },
  { code: "+221", country: "🇸🇳 Senegal" },
  { code: "+381", country: "🇷🇸 Serbia" },
  { code: "+248", country: "🇸🇨 Seychelles" },
  { code: "+232", country: "🇸🇱 Sierra Leone" },
  { code: "+65", country: "🇸🇬 Singapore" },
  { code: "+421", country: "🇸🇰 Slovakia" },
  { code: "+386", country: "🇸🇮 Slovenia" },
  { code: "+677", country: "🇸🇧 Solomon Islands" },
  { code: "+252", country: "🇸🇴 Somalia" },
  { code: "+27", country: "🇿🇦 South Africa" },
  { code: "+82", country: "🇰🇷 South Korea" },
  { code: "+34", country: "🇪🇸 Spain" },
  { code: "+94", country: "🇱🇰 Sri Lanka" },
  { code: "+249", country: "🇸🇩 Sudan" },
  { code: "+597", country: "🇸🇷 Suriname" },
  { code: "+268", country: "🇸🇿 Eswatini" },
  { code: "+46", country: "🇸🇪 Sweden" },
  { code: "+41", country: "🇨🇭 Switzerland" },
  { code: "+963", country: "🇸🇾 Syria" },
  { code: "+886", country: "🇹🇼 Taiwan" },
  { code: "+992", country: "🇹🇯 Tajikistan" },
  { code: "+255", country: "🇹🇿 Tanzania" },
  { code: "+66", country: "🇹🇭 Thailand" },
  { code: "+228", country: "🇹🇬 Togo" },
  { code: "+676", country: "🇹🇴 Tonga" },
  { code: "+216", country: "🇹🇳 Tunisia" },
  { code: "+90", country: "🇹🇷 Turkey" },
  { code: "+993", country: "🇹🇲 Turkmenistan" },
  { code: "+688", country: "🇹🇻 Tuvalu" },
  { code: "+256", country: "🇺🇬 Uganda" },
  { code: "+380", country: "🇺🇦 Ukraine" },
  { code: "+971", country: "🇦🇪 United Arab Emirates" },
  { code: "+44", country: "🇬🇧 United Kingdom" },
  { code: "+1", country: "🇺🇸 United States" },
  { code: "+598", country: "🇺🇾 Uruguay" },
  { code: "+998", country: "🇺🇿 Uzbekistan" },
  { code: "+678", country: "🇻🇺 Vanuatu" },
  { code: "+379", country: "🇻🇦 Vatican" },
  { code: "+58", country: "🇻🇪 Venezuela" },
  { code: "+84", country: "🇻🇳 Vietnam" },
  { code: "+260", country: "🇿🇲 Zambia" },
  { code: "+263", country: "🇿🇼 Zimbabwe" }
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
              {getFlagEmoji(c.iso)} {c.country} ({c.code})
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
