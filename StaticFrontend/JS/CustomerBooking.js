document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".tab");
    const cards = document.querySelectorAll(".booking-card");
    const modal = document.querySelector("#detailsModal");
    const modalCloseButtons = document.querySelectorAll(".modal-close, #modalCloseBtn");

    const modalBookingId = document.querySelector("#modalBookingId");
    const modalServiceName = document.querySelector("#modalServiceName");
    const modalStatus = document.querySelector("#modalStatus");
    const modalWorker = document.querySelector("#modalWorker");
    const modalDate = document.querySelector("#modalDate");
    const modalTime = document.querySelector("#modalTime");
    const modalLocation = document.querySelector("#modalLocation");
    const modalPrice = document.querySelector("#modalPrice");
    const modalIcon = document.querySelector("#modalIcon");
    const modalIconSymbol = document.querySelector("#modalIconSymbol");

    const statusClassMap = {
        upcoming: "upcoming",
        completed: "completed",
        progress: "progress",
    };

    const openModal = () => {
        if (!modal) return;
        modal.classList.add("active");
        modal.setAttribute("aria-hidden", "false");
    };

    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove("active");
        modal.setAttribute("aria-hidden", "true");
    };

    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((item) => item.classList.remove("active"));
            tab.classList.add("active");

            const filter = tab.dataset.filter;

            cards.forEach((card) => {
                const status = card.dataset.status;
                const show = filter === "all" || status === filter;
                card.classList.toggle("hidden", !show);
            });
        });
    });

    cards.forEach((card) => {
        const detailsBtn = card.querySelector(".details-btn");

        detailsBtn?.addEventListener("click", () => {
            const serviceName = card.querySelector(".service-meta h3")?.textContent?.trim() || "";
            const bookingId = card.querySelector(".service-meta p")?.textContent?.trim() || "";
            const statusText = card.querySelector(".status-pill")?.textContent?.trim() || "";
            const workerText = card.querySelector(".details p:nth-child(1)")?.textContent || "";
            const dateText = card.querySelector(".details p:nth-child(2)")?.textContent || "";
            const timeText = card.querySelector(".details p:nth-child(3)")?.textContent || "";
            const locationText = card.querySelector(".details p:nth-child(4)")?.textContent || "";
            const priceText = card.querySelector(".price")?.textContent?.trim() || "";
            const statusKey = card.querySelector(".status-pill")?.classList[1] || "upcoming";
            const cardIcon = card.querySelector(".service-icon")?.classList[1] || "yellow";
            const iconSymbolClass = card.querySelector(".service-icon i")?.className || "";

            if (modalBookingId) modalBookingId.textContent = bookingId;
            if (modalServiceName) modalServiceName.textContent = serviceName;
            if (modalStatus) {
                modalStatus.textContent = statusText;
                modalStatus.className = `status-pill ${statusClassMap[statusKey] || "upcoming"}`;
            }
            if (modalWorker) modalWorker.textContent = workerText.replace("Worker:", "").trim();
            if (modalDate) modalDate.textContent = dateText.replace("Date:", "").trim();
            if (modalTime) modalTime.textContent = timeText.replace("Time:", "").trim();
            if (modalLocation) modalLocation.textContent = locationText.replace("Location:", "").trim();
            if (modalPrice) modalPrice.textContent = priceText;
            if (modalIcon) modalIcon.className = `modal-icon ${cardIcon}`;
            if (modalIconSymbol) modalIconSymbol.className = iconSymbolClass;

            openModal();
        });
    });

    modalCloseButtons.forEach((button) => {
        button.addEventListener("click", closeModal);
    });

    modal?.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal?.classList.contains("active")) {
            closeModal();
        }
    });
});
