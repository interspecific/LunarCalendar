document.addEventListener("DOMContentLoaded", () => {
    const currentDate = new Date();
    document.getElementById("current-date").textContent = currentDate.toDateString();

    generateLunarCalendar(); // ✅ Default to Lunar Calendar
    loadTaskData();
    displayJournalEntries();
    requestNotificationPermission();
    checkNotifications();
    autoDarkMode();
    setupAccordions();
});

// ✅ Calendar State
let lunarMode = true;
let selectedYear = new Date().getFullYear();
let selectedMonth = new Date().getMonth(); // 0-indexed (Jan = 0, Feb = 1, etc.)

// ✅ Moon Phase Calculation
function getMoonPhase(year, month, day) {
    const lp = 2551443; // Moon cycle length in seconds
    const now = new Date(year, month - 1, day, 20, 35, 0);
    const new_moon = new Date(1970, 0, 7, 20, 35, 0);
    const phase = ((now.getTime() - new_moon.getTime()) / 1000) % lp;
    return Math.floor((phase / lp) * 8);
}

// ✅ Find the Most Recent New Moon
function getLastNewMoon() {
    const currentDate = new Date(selectedYear, selectedMonth, 1);
    let daysAgo = 0;
    while (getMoonPhase(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate() - daysAgo) !== 0) {
        daysAgo++;
    }
    return new Date(currentDate.setDate(currentDate.getDate() - daysAgo));
}

// ✅ Generate Lunar Calendar
function generateLunarCalendar() {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    let startDate = getLastNewMoon(); // Get last New Moon date
    let lunarDays = 29; // A lunar month is ~29.5 days

    for (let day = 0; day < lunarDays; day++) {
        let date = new Date(startDate);
        date.setDate(startDate.getDate() + day);

        const dayDiv = document.createElement("div");
        dayDiv.className = "day";
        dayDiv.dataset.date = date.toISOString().split("T")[0];

        let moonPhaseIndex = getMoonPhase(date.getFullYear(), date.getMonth() + 1, date.getDate());
        let moonPhases = ["🌑 New Moon", "🌒 Waxing Crescent", "🌓 First Quarter", "🌔 Waxing Gibbous", "🌕 Full Moon", "🌖 Waning Gibbous", "🌗 Last Quarter", "🌘 Waning Crescent"];

        dayDiv.innerHTML = `<p>${date.toDateString().split(" ")[1]} ${date.getDate()}</p>
                            <p>${moonPhases[moonPhaseIndex]}</p>`;

        if (isToday(date)) {
            dayDiv.classList.add("current-day"); // Highlight today
        }

        dayDiv.onclick = () => openPlanner(dayDiv.dataset.date);
        calendar.appendChild(dayDiv);
    }

    updateCalendarHeader();
}

// ✅ Generate Gregorian Calendar
function generateGregorianCalendar() {
    const calendar = document.getElementById("calendar");
    calendar.innerHTML = "";

    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
        let date = new Date(selectedYear, selectedMonth, day);

        let div = document.createElement("div");
        div.className = "day";
        div.textContent = day;
        div.dataset.date = date.toISOString().split("T")[0];

        let moonPhaseIndex = getMoonPhase(date.getFullYear(), date.getMonth() + 1, date.getDate());
        let moonPhases = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];
        div.innerHTML += ` <span>${moonPhases[moonPhaseIndex]}</span>`;

        if (isToday(date)) {
            div.classList.add("current-day"); // Highlight today
        }

        div.onclick = () => openPlanner(div.dataset.date);
        calendar.appendChild(div);
    }

    updateCalendarHeader();
}

// ✅ Update Calendar Header (Month & Year)
function updateCalendarHeader() {
    const monthNames = [
        "January", "February", "March", "April", "May", "June", 
        "July", "August", "September", "October", "November", "December"
    ];
    document.getElementById("calendarMonth").textContent = `${monthNames[selectedMonth]} ${selectedYear}`;
}

// ✅ Toggle Between Lunar and Gregorian Calendar
function toggleCalendarMode() {
    lunarMode = !lunarMode;
    if (lunarMode) {
        generateLunarCalendar();
    } else {
        generateGregorianCalendar();
    }
}

// ✅ Navigation: Previous & Next Month
function changeMonth(offset) {
    selectedMonth += offset;

    if (selectedMonth < 0) {
        selectedMonth = 11;
        selectedYear--;
    } else if (selectedMonth > 11) {
        selectedMonth = 0;
        selectedYear++;
    }

    if (lunarMode) {
        generateLunarCalendar();
    } else {
        generateGregorianCalendar();
    }
}

// ✅ Check if a date is today
function isToday(date) {
    const today = new Date();
    return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
    );
}

document.addEventListener("DOMContentLoaded", () => {
    // Attach event listeners to the EXISTING buttons in HTML
    document.getElementById("prevMonth").addEventListener("click", () => changeMonth(-1));
    document.getElementById("nextMonth").addEventListener("click", () => changeMonth(1));

    let toggleButton = document.createElement("button");
    toggleButton.innerHTML = "🔄 Switch to Gregorian Calendar";
    toggleButton.onclick = function () {
        toggleCalendarMode();
        toggleButton.innerHTML = lunarMode ? "🔄 Switch to Gregorian Calendar" : "🌙 Switch to Lunar Calendar";
    };

    // Insert only the toggle button (since navigation buttons already exist)
    document.querySelector(".container").insertBefore(toggleButton, document.getElementById("calendar"));
});






// ✅ Toggle Accordions
document.addEventListener("DOMContentLoaded", () => {
    const accordions = document.querySelectorAll(".accordion");
    
    accordions.forEach(acc => {
        acc.addEventListener("click", function() {
            this.classList.toggle("active");
            const panel = this.nextElementSibling;
            panel.style.display = panel.style.display === "block" ? "none" : "block";
        });
    });
});



























// ✅ Generate Google Calendar Event URL
function addToGoogleCalendar(taskOrRitual, date) {
    const baseURL = "https://calendar.google.com/calendar/render?action=TEMPLATE";
    const eventTitle = encodeURIComponent(`🔮 ${taskOrRitual}`);
    const eventDetails = encodeURIComponent("Added from Lunar Task & Ritual Planner.");
    
    const eventDate = new Date(date);
    const startDate = eventDate.toISOString().split("T")[0] + "T18:00:00Z"; // Default 6 PM UTC
    const endDate = eventDate.toISOString().split("T")[0] + "T19:00:00Z"; // 1-hour duration

    const googleCalendarURL = `${baseURL}&text=${eventTitle}&details=${eventDetails}&dates=${startDate}/${endDate}`;
    
    window.open(googleCalendarURL, "_blank"); // Open Google Calendar event page
}

// ✅ Modify addRitual() to Include Google Calendar Button
function addRitual() {
    let ritualInput = document.getElementById("ritualInput");
    let ritualText = ritualInput.value.trim();
    if (!ritualText) return;

    let selectedDate = parseInt(document.getElementById("modal-date").textContent.split(" ")[1]);
    
    taskData[selectedDate] = taskData[selectedDate] || { tasks: [], rituals: [] };
    taskData[selectedDate].rituals.push(ritualText);
    localStorage.setItem("taskData", JSON.stringify(taskData));

    let ritualList = document.getElementById("ritualList");
    let li = document.createElement("li");
    li.innerHTML = `${ritualText} 
        <button onclick="removeRitual(${selectedDate}, '${ritualText}')">❌</button>
        <button onclick="addToGoogleCalendar('${ritualText}', '${new Date().toISOString()}')">📆 Add to Google Calendar</button>`;
    ritualList.appendChild(li);

    ritualInput.value = "";
}

// ✅ Modify addTask() to Include Google Calendar Button
function addTask() {
    let taskInput = document.getElementById("taskInput");
    let taskText = taskInput.value.trim();
    if (!taskText) return;

    let selectedDate = parseInt(document.getElementById("modal-date").textContent.split(" ")[1]);

    taskData[selectedDate] = taskData[selectedDate] || { tasks: [], rituals: [] };
    taskData[selectedDate].tasks.push(taskText);
    localStorage.setItem("taskData", JSON.stringify(taskData));

    let taskList = document.getElementById("taskList");
    let li = document.createElement("li");
    li.innerHTML = `${taskText} 
        <button onclick="removeTask(${selectedDate}, '${taskText}')">❌</button>
        <button onclick="addToGoogleCalendar('${taskText}', '${new Date().toISOString()}')">📆 Add to Google Calendar</button>`;
    taskList.appendChild(li);

    taskInput.value = "";
}










// ✅ Request Notification Permission
function requestNotificationPermission() {
    if (Notification.permission !== "granted") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Notifications enabled!");
            }
        });
    }
}

// ✅ Send a Browser Notification
function sendNotification(title, message) {
    if (Notification.permission === "granted") {
        new Notification(title, { body: message });
    }
}

// ✅ Check for Upcoming Rituals & Moon Phases
function checkNotifications() {
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const moonPhases = [
        "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
        "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"
    ];

    // 🔹 Check for Moon Phase Changes
    const moonPhaseIndex = getMoonPhase(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDay);
    if (moonPhaseIndex === 0 || moonPhaseIndex === 4) { // New Moon or Full Moon
        sendNotification("🌙 Moon Phase Update", `It's a ${moonPhases[moonPhaseIndex]} today!`);
    }

    // 🔹 Check for Scheduled Rituals
    if (taskData[currentDay]?.rituals?.length) {
        taskData[currentDay].rituals.forEach(ritual => {
            sendNotification("🔮 Ritual Reminder", `Reminder: ${ritual} is scheduled today!`);
        });
    }
}

// ✅ Run Notifications Check Every Hour
setInterval(checkNotifications, 3600000); // 1 hour
requestNotificationPermission();





async function fetchHoroscope() {
    const sign = document.getElementById("zodiacSign").value;
    const url = `https://aztro.sameerkumar.website/?sign=${sign}&day=today`;

    try {
        const response = await fetch(url, { method: "POST" }); // API requires POST request
        const data = await response.json();

        document.getElementById("horoscopeResult").innerHTML = `
            <strong>${sign.toUpperCase()} Horoscope:</strong> ${data.description} 
            <br> 💫 <strong>Lucky Color:</strong> ${data.color} 
            <br> 🔥 <strong>Mood:</strong> ${data.mood} 
            <br> 🍀 <strong>Lucky Number:</strong> ${data.lucky_number}`;
    } catch (error) {
        document.getElementById("horoscopeResult").innerHTML = "❌ Error fetching horoscope.";
        console.error("Horoscope API Error:", error);
    }
}


// Load SunCalc.js
const script = document.createElement("script");
script.src = "https://cdnjs.cloudflare.com/ajax/libs/suncalc/1.8.0/suncalc.min.js";
document.head.appendChild(script);

script.onload = function() {
    getMoonSign();
};

// 🌙 Determine the Moon's Zodiac Sign
function getMoonSign() {
    const now = new Date();
    const moonPosition = SunCalc.getMoonPosition(now, 0, 0); // (Lat: 0, Lon: 0 for simplicity)
    const moonEclipticLongitude = (moonPosition.azimuth * (180 / Math.PI)) % 360;
    
    const zodiacSigns = [
        "♈ Aries", "♉ Taurus", "♊ Gemini", "♋ Cancer",
        "♌ Leo", "♍ Virgo", "♎ Libra", "♏ Scorpio",
        "♐ Sagittarius", "♑ Capricorn", "♒ Aquarius", "♓ Pisces"
    ];

    const signIndex = Math.floor((moonEclipticLongitude + 15) / 30) % 12;
    const currentMoonSign = zodiacSigns[signIndex];

    document.getElementById("moonSign").textContent = currentMoonSign;
    displayMoonAdvice(currentMoonSign);
}

// 🧘 Astrology-Based Guidance
function displayMoonAdvice(moonSign) {
    const advice = {
        "♈ Aries": "🔥 High energy day! Great for starting new projects.",
        "♉ Taurus": "🌱 Focus on self-care and grounding practices.",
        "♊ Gemini": "💬 Perfect time for socializing and communication.",
        "♋ Cancer": "💖 Emotional depth—reflect on your feelings.",
        "♌ Leo": "🎭 Creative and expressive day. Shine bright!",
        "♍ Virgo": "📅 Organize, plan, and focus on details.", 
        "♎ Libra": "⚖️ Balance your relationships and partnerships.",
        "♏ Scorpio": "🕵️‍♀️ Deep transformation—explore the unknown.",
        "♐ Sagittarius": "🏹 Expand your horizons and seek adventure.",
        "♑ Capricorn": "🏆 Stay disciplined and work toward your goals.",
        "♒ Aquarius": "🚀 Think outside the box and embrace innovation.",
        "♓ Pisces": "🌊 A dreamy day for meditation and intuition."
    };

    document.getElementById("moonAdvice").textContent = advice[moonSign] || "🌑 View your daily sign";
}











document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("drawTarot").addEventListener("click", drawCard);
});

function drawCard() {
    fetch("https://tarotapi.dev/api/v1/cards/random?n=1")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("API Response:", data); // Debugging

            if (data.cards && data.cards.length > 0) {
                const card = data.cards[0];

                document.getElementById("tarotResult").innerHTML = `<strong>${card.name}</strong>: ${card.meaning_up}`;
                document.getElementById("tarotImage").src = card.image || "https://via.placeholder.com/150?text=No+Image";
                document.getElementById("tarotImage").style.display = "block";
            } else {
                document.getElementById("tarotResult").textContent = "No card data received!";
            }
        })
        .catch(error => {
            console.error("Error fetching tarot card:", error);
            document.getElementById("tarotResult").textContent = "Error fetching card. Please try again!";
        });
}




// 🃏 Tarot Image Map (Since API Doesn't Provide Images)
const tarotImageMap = {
    "ar00": "https://www.example.com/tarot/fool.jpg",
    "ar01": "https://www.example.com/tarot/magician.jpg",
    "ar02": "https://www.example.com/tarot/high-priestess.jpg",
    "ar03": "https://www.example.com/tarot/empress.jpg",
    "ar04": "https://www.example.com/tarot/emperor.jpg",
    "ar05": "https://www.example.com/tarot/hierophant.jpg",
    "ar06": "https://www.example.com/tarot/lovers.jpg",
    "ar07": "https://www.example.com/tarot/chariot.jpg",
    "ar08": "https://www.example.com/tarot/strength.jpg",
    "ar09": "https://www.example.com/tarot/hermit.jpg",
    "ar10": "https://www.example.com/tarot/wheel-of-fortune.jpg",
    "ar11": "https://www.example.com/tarot/justice.jpg",
    "ar12": "https://www.example.com/tarot/hanged-man.jpg",
    "ar13": "https://www.example.com/tarot/death.jpg",
    "ar14": "https://www.example.com/tarot/temperance.jpg",
    "ar15": "https://www.example.com/tarot/devil.jpg",
    "ar16": "https://www.example.com/tarot/tower.jpg",
    "ar17": "https://www.example.com/tarot/star.jpg",
    "ar18": "https://www.example.com/tarot/moon.jpg",
    "ar19": "https://www.example.com/tarot/sun.jpg",
    "ar20": "https://www.example.com/tarot/judgment.jpg",
    "ar21": "https://www.example.com/tarot/world.jpg",
    
    // Minor Arcana: Wands
    "wapa": "https://www.example.com/tarot/page-of-wands.jpg",
    "wakn": "https://www.example.com/tarot/knight-of-wands.jpg",
    "waqu": "https://www.example.com/tarot/queen-of-wands.jpg",
    "waki": "https://www.example.com/tarot/king-of-wands.jpg",
    "waac": "https://www.example.com/tarot/ace-of-wands.jpg",
    "wa02": "https://www.example.com/tarot/two-of-wands.jpg",
    "wa03": "https://www.example.com/tarot/three-of-wands.jpg",
    "wa04": "https://www.example.com/tarot/four-of-wands.jpg",
    "wa05": "https://www.example.com/tarot/five-of-wands.jpg",
    "wa06": "https://www.example.com/tarot/six-of-wands.jpg",
    "wa07": "https://www.example.com/tarot/seven-of-wands.jpg",
    "wa08": "https://www.example.com/tarot/eight-of-wands.jpg",
    "wa09": "https://www.example.com/tarot/nine-of-wands.jpg",
    "wa10": "https://www.example.com/tarot/ten-of-wands.jpg",

    // Minor Arcana: Cups
    "cupa": "https://www.example.com/tarot/page-of-cups.jpg",
    "cukn": "https://www.example.com/tarot/knight-of-cups.jpg",
    "cuqu": "https://www.example.com/tarot/queen-of-cups.jpg",
    "cuki": "https://www.example.com/tarot/king-of-cups.jpg",
    "cuac": "https://www.example.com/tarot/ace-of-cups.jpg",
    "cu02": "https://www.example.com/tarot/two-of-cups.jpg",
    "cu03": "https://www.example.com/tarot/three-of-cups.jpg",
    "cu04": "https://www.example.com/tarot/four-of-cups.jpg",
    "cu05": "https://www.example.com/tarot/five-of-cups.jpg",
    "cu06": "https://www.example.com/tarot/six-of-cups.jpg",
    "cu07": "https://www.example.com/tarot/seven-of-cups.jpg",
    "cu08": "https://www.example.com/tarot/eight-of-cups.jpg",
    "cu09": "https://www.example.com/tarot/nine-of-cups.jpg",
    "cu10": "https://www.example.com/tarot/ten-of-cups.jpg",

    // Minor Arcana: Swords
    "swpa": "https://www.example.com/tarot/page-of-swords.jpg",
    "swkn": "https://www.example.com/tarot/knight-of-swords.jpg",
    "swqu": "https://www.example.com/tarot/queen-of-swords.jpg",
    "swki": "https://www.example.com/tarot/king-of-swords.jpg",
    "swac": "https://www.example.com/tarot/ace-of-swords.jpg",
    "sw02": "https://www.example.com/tarot/two-of-swords.jpg",
    "sw03": "https://www.example.com/tarot/three-of-swords.jpg",
    "sw04": "https://www.example.com/tarot/four-of-swords.jpg",
    "sw05": "https://www.example.com/tarot/five-of-swords.jpg",
    "sw06": "https://www.example.com/tarot/six-of-swords.jpg",
    "sw07": "https://www.example.com/tarot/seven-of-swords.jpg",
    "sw08": "https://www.example.com/tarot/eight-of-swords.jpg",
    "sw09": "https://www.example.com/tarot/nine-of-swords.jpg",
    "sw10": "https://www.example.com/tarot/ten-of-swords.jpg",

    // Minor Arcana: Pentacles
    "pepa": "https://www.example.com/tarot/page-of-pentacles.jpg",
    "pekn": "https://www.example.com/tarot/knight-of-pentacles.jpg",
    "pequ": "https://www.example.com/tarot/queen-of-pentacles.jpg",
    "peki": "https://www.example.com/tarot/king-of-pentacles.jpg",
    "peac": "https://www.example.com/tarot/ace-of-pentacles.jpg",
    "pe02": "https://www.example.com/tarot/two-of-pentacles.jpg",
    "pe03": "https://www.example.com/tarot/three-of-pentacles.jpg",
    "pe04": "https://www.example.com/tarot/four-of-pentacles.jpg",
    "pe05": "https://www.example.com/tarot/five-of-pentacles.jpg",
    "pe06": "https://www.example.com/tarot/six-of-pentacles.jpg",
    "pe07": "https://www.example.com/tarot/seven-of-pentacles.jpg",
    "pe08": "https://www.example.com/tarot/eight-of-pentacles.jpg",
    "pe09": "https://www.example.com/tarot/nine-of-pentacles.jpg",
    "pe10": "https://www.example.com/tarot/ten-of-pentacles.jpg"
};













let journalEntries = JSON.parse(localStorage.getItem("journalEntries")) || [];

// 💾 Save Journal Entry
function saveJournalEntry() {
    const entryText = document.getElementById("journalEntry").value.trim();
    if (!entryText) return;

    const currentDate = new Date();
    const moonPhaseIndex = getMoonPhase(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate());
    const moonPhases = [
        "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
        "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"
    ];
    const moonPhase = moonPhases[moonPhaseIndex];

    const newEntry = {
        date: currentDate.toDateString(),
        moonPhase: moonPhase,
        text: entryText
    };

    journalEntries.push(newEntry);
    localStorage.setItem("journalEntries", JSON.stringify(journalEntries));
    
    document.getElementById("journalEntry").value = ""; // Clear input field
    displayJournalEntries();
}

// 📜 Display Saved Journal Entries
function displayJournalEntries() {
    const journalList = document.getElementById("journalList");
    journalList.innerHTML = "";

    journalEntries.forEach((entry, index) => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${entry.date} (${entry.moonPhase})</strong>
                        <p>${entry.text}</p>
                        <button onclick="deleteJournalEntry(${index})">❌ Delete</button>`;
        journalList.appendChild(li);
    });
}

// 🔍 Search Journal Entries
function searchJournalEntries() {
    const searchText = document.getElementById("searchJournal").value.toLowerCase();
    const journalList = document.getElementById("journalList");
    
    journalList.innerHTML = "";

    journalEntries.forEach((entry, index) => {
        if (entry.text.toLowerCase().includes(searchText) || entry.moonPhase.toLowerCase().includes(searchText)) {
            const li = document.createElement("li");
            li.innerHTML = `<strong>${entry.date} (${entry.moonPhase})</strong>
                            <p>${entry.text}</p>
                            <button onclick="deleteJournalEntry(${index})">❌ Delete</button>`;
            journalList.appendChild(li);
        }
    });
}

// ❌ Delete Journal Entry
function deleteJournalEntry(index) {
    journalEntries.splice(index, 1);
    localStorage.setItem("journalEntries", JSON.stringify(journalEntries));
    displayJournalEntries();
}

// Load journal entries on page load
displayJournalEntries();


// ✅ Load User Preferences
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("darkMode") === "enabled") {
        document.body.classList.add("dark-mode");
        document.getElementById("darkModeToggle").checked = true;
    }
    
    const savedTheme = localStorage.getItem("theme") || "default";
    document.getElementById("themeSelector").value = savedTheme;
    applyTheme();
});

// 🌑 Toggle Dark Mode
function toggleDarkMode() {
    const isDark = document.getElementById("darkModeToggle").checked;
    if (isDark) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("darkMode", "enabled");
    } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("darkMode", "disabled");
    }
}

// 🎨 Apply Selected Theme
function applyTheme() {
    const theme = document.getElementById("themeSelector").value;
    document.body.className = theme;
    if (document.body.classList.contains("dark-mode")) {
        document.body.classList.add("dark-mode");
    }
    localStorage.setItem("theme", theme);
}

// 🌙 Auto Dark Mode at Night (Optional)
function autoDarkMode() {
    const hour = new Date().getHours();
    if (hour >= 19 || hour < 6) { // 7 PM - 6 AM
        document.body.classList.add("dark-mode");
        document.getElementById("darkModeToggle").checked = true;
        localStorage.setItem("darkMode", "enabled");
    }
}
autoDarkMode();


