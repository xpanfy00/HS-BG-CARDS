document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("cardGrid");
    const tierButtons = document.querySelectorAll('.star-btn');
    const cardTypeSelect = document.querySelectorAll('select.dropdown')[0]; // cardTypeId
    const typeSelect = document.querySelectorAll('select.dropdown')[1]; // classId
    const modeSelect = document.getElementById("modeSelect");

    let selectedTiers = [];
    let selectedClassId = null;
    let selectedCardTypeId = null;
    let selectedMode = "any";

    let allCards = [];

    const renderCards = () => {
        container.innerHTML = "";

        const filtered = allCards.filter(card => {
            const isTierRelevant = selectedCardTypeId === 4 || selectedCardTypeId === 42;
            const isClassRelevant = selectedCardTypeId === 4;

            const modeMatch =
                selectedMode === "any"
                    ? card.duosOnly === false && card.solosOnly === false
                    : selectedMode === "duos"
                        ? card.duosOnly === true
                        : selectedMode === "solo"
                            ? (
                                selectedCardTypeId === 4
                                    ? card.duosOnly !== true // исключаем только дуос-карты
                                    : card.solosOnly === true
                            )
                            : true;

            const tierMatch =
                !isTierRelevant ||
                selectedTiers.length === 0 ||
                (typeof card.tier === 'number' && selectedTiers.includes(card.tier));

            const classIdMatch =
                !isClassRelevant ||
                selectedClassId === null ||
                Number(card.classId) === selectedClassId;

            const cardTypeIdMatch =
                selectedCardTypeId === null ||
                card.cardTypeId === selectedCardTypeId;

            return tierMatch && classIdMatch && cardTypeIdMatch && modeMatch;
        });

        // отрисовка
        filtered.forEach(card => {
            const div = document.createElement("div");
            div.className = "card";
            div.innerHTML = `
                <div class="card-id">#${card.id}</div>
                <div class="card-title">${card.name}</div>
                <img src="${card.image || 'https://via.placeholder.com/250x150?text=No+Image'}" 
                     alt="${card.name}" class="card-image"/>
                <div class="card-text">${card.text}</div>
            `;
            container.appendChild(div);
        });

        console.log({
            cardTypeId: selectedCardTypeId,
            classId: selectedClassId,
            tiers: selectedTiers,
            mode: selectedMode
        });
    };

    // первая загрузка с сервера
    fetch("https://hs-cards.onrender.com/card")
        .then(res => res.json())
        .then(data => {
            allCards = data;
            renderCards(); // сразу отображаем всё
        })
        .catch(error => {
            console.error("Ошибка загрузки карточек:", error);
            container.innerHTML = "<p style='color:red;'>Не удалось загрузить карточки</p>";
        });


    // ⭐ Tier (звёзды)
    tierButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('selected');
            selectedTiers = Array.from(document.querySelectorAll('.star-btn.selected'))
                .map(btn => Number(btn.dataset.tier));
            renderCards();
        });
    });

    // 🧬 classId (Beast, Demon...)
    typeSelect.addEventListener("change", () => {
        const value = typeSelect.value;
        selectedClassId = value === "0" || value === "Any" || value === "All" ? null : Number(value);
        renderCards();
    });

    // 🧩 cardTypeId (Minion, Spell...)
    cardTypeSelect.addEventListener("change", () => {
        const value = cardTypeSelect.value;
        selectedCardTypeId = value === "0" ? null : Number(value);
        renderCards();
    });

    // 🎮 Mode (duos/solo/any)
    modeSelect.addEventListener("change", () => {
        selectedMode = modeSelect.value;
        renderCards();
    });
});
