/* =====================================================
   DOM ELEMENTS
===================================================== */

const tableBody =
    document.getElementById("appointmentsTableBody");

const totalAppointments =
    document.getElementById("totalAppointments");

const todayAppointments =
    document.getElementById("todayAppointments");

const upcomingAppointments =
    document.getElementById("upcomingAppointments");

const newAppointments =
    document.getElementById("newAppointments");

const confirmedAppointments =
    document.getElementById("confirmedAppointments");

const completedAppointments =
    document.getElementById("completedAppointments");

const cancelledAppointments =
    document.getElementById("cancelledAppointments");

const refreshBtn =
    document.getElementById("refreshBtn");

const searchInput =
    document.getElementById("searchInput");

const clearSearchBtn =
    document.getElementById("clearSearchBtn");

const searchResultInfo =
    document.getElementById("searchResultInfo");


/* =====================================================
   DATA
===================================================== */

let allAppointments = [];

let currentFilter = "all";

let currentSearch = "";


/* =====================================================
   LOAD APPOINTMENTS
===================================================== */

async function loadAppointments() {

    try {

        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="loading">
                    جاري تحميل المواعيد...
                </td>
            </tr>
        `;

        const response = await fetch(
            "http://localhost:3000/api/appointments"
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message || "تعذر جلب المواعيد"
            );

        }

        allAppointments = data.appointments || [];

        updateStatistics(allAppointments);

        displayAppointments(
            getFilteredAppointments()
        );

    } catch (error) {

        console.error(
            "Load appointments error:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="error">
                    تعذر الاتصال بالخادم.
                    تأكد من تشغيل Backend.
                </td>
            </tr>
        `;

    }

}


/* =====================================================
   STATISTICS
===================================================== */

function updateStatistics(appointments) {

    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const total =
        appointments.length;


    const todayCount =
        appointments.filter(function (appointment) {

            return appointment.date === today;

        }).length;


    const upcomingCount =
        appointments.filter(function (appointment) {

            return (
                appointment.date >= today &&
                (appointment.status || "new") !== "cancelled"
            );

        }).length;


    const newCount =
        appointments.filter(function (appointment) {

            return (
                (appointment.status || "new") === "new"
            );

        }).length;


    const confirmedCount =
        appointments.filter(function (appointment) {

            return appointment.status === "confirmed";

        }).length;


    const completedCount =
        appointments.filter(function (appointment) {

            return appointment.status === "completed";

        }).length;


    const cancelledCount =
        appointments.filter(function (appointment) {

            return appointment.status === "cancelled";

        }).length;


    totalAppointments.textContent =
        total;

    todayAppointments.textContent =
        todayCount;

    upcomingAppointments.textContent =
        upcomingCount;

    newAppointments.textContent =
        newCount;

    confirmedAppointments.textContent =
        confirmedCount;

    completedAppointments.textContent =
        completedCount;

    cancelledAppointments.textContent =
        cancelledCount;

}


/* =====================================================
   NORMALIZE SEARCH
===================================================== */

function normalizeSearch(value) {

    return String(value || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, " ");

}


/* =====================================================
   SEARCH
===================================================== */

function getSearchFilteredAppointments(appointments) {

    if (!currentSearch) {

        return appointments;

    }


    const search =
        normalizeSearch(currentSearch);


    return appointments.filter(
        function (appointment) {

            const name =
                normalizeSearch(
                    appointment.name
                );

            const phone =
                normalizeSearch(
                    appointment.phone
                );

            const service =
                normalizeSearch(
                    appointment.service
                );

            const message =
                normalizeSearch(
                    appointment.message
                );

            const date =
                normalizeSearch(
                    appointment.date
                );


            return (
                name.includes(search) ||
                phone.includes(search) ||
                service.includes(search) ||
                message.includes(search) ||
                date.includes(search)
            );

        }
    );

}


/* =====================================================
   FILTER + SEARCH
===================================================== */

function getFilteredAppointments() {

    let appointments =
        [...allAppointments];


    /* FILTER */

    if (currentFilter !== "all") {

        appointments =
            appointments.filter(
                function (appointment) {

                    return (
                        appointment.status ||
                        "new"
                    ) === currentFilter;

                }
            );

    }


    /* SEARCH */

    appointments =
        getSearchFilteredAppointments(
            appointments
        );


    return appointments;

}


/* =====================================================
   DISPLAY APPOINTMENTS
===================================================== */

function displayAppointments(appointments) {

    if (appointments.length === 0) {

        let message =
            "لا توجد مواعيد";

        if (currentSearch) {

            message =
                "لا توجد نتائج مطابقة للبحث";

        } else if (currentFilter !== "all") {

            message =
                "لا توجد مواعيد في هذه الحالة";

        }


        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty">
                    ${message}
                </td>
            </tr>
        `;


        updateSearchInfo(0);

        return;

    }


    tableBody.innerHTML = "";


    appointments.forEach(
        function (appointment) {

            const row =
                document.createElement("tr");


            const status =
                appointment.status || "new";


            row.innerHTML = `

                <td>
                    ${appointment.id}
                </td>

                <td>
                    ${escapeHTML(
                        appointment.name
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        appointment.phone
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        appointment.service
                    )}
                </td>

                <td>
                    ${formatDate(
                        appointment.date
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        appointment.message ||
                        "لا توجد"
                    )}
                </td>

                <td>
                    ${formatCreatedAt(
                        appointment.created_at
                    )}
                </td>

                <td>

                    <span class="status ${status}">
                        ${getStatusText(status)}
                    </span>

                </td>

                <td>

                    <div class="action-buttons">

                        <select
                            class="status-select"
                            data-id="${appointment.id}"
                        >

                            <option
                                value="new"
                                ${status === "new"
                                    ? "selected"
                                    : ""}
                            >
                                جديد
                            </option>

                            <option
                                value="confirmed"
                                ${status === "confirmed"
                                    ? "selected"
                                    : ""}
                            >
                                مؤكد
                            </option>

                            <option
                                value="completed"
                                ${status === "completed"
                                    ? "selected"
                                    : ""}
                            >
                                مكتمل
                            </option>

                            <option
                                value="cancelled"
                                ${status === "cancelled"
                                    ? "selected"
                                    : ""}
                            >
                                ملغي
                            </option>

                        </select>


                        <button
                            type="button"
                            class="edit-btn"
                            data-id="${appointment.id}"
                        >
                            ✏️ تعديل
                        </button>


                        <button
                            type="button"
                            class="delete-btn"
                            data-id="${appointment.id}"
                        >
                            🗑️ حذف
                        </button>

                    </div>

                </td>

            `;


            tableBody.appendChild(row);

        }
    );


    updateSearchInfo(
        appointments.length
    );


    addStatusEvents();

    addDeleteEvents();

    addEditEvents();

}


/* =====================================================
   SEARCH INFO
===================================================== */

function updateSearchInfo(count) {

    if (!searchResultInfo) {
        return;
    }


    if (!currentSearch) {

        searchResultInfo.textContent = "";

        return;

    }


    searchResultInfo.textContent =
        `تم العثور على ${count} ${count === 1 ? "نتيجة" : "نتائج"}`;

}


/* =====================================================
   SEARCH EVENTS
===================================================== */

function addSearchEvents() {

    if (!searchInput) {
        return;
    }


    searchInput.addEventListener(
        "input",
        function () {

            currentSearch =
                normalizeSearch(this.value);


            updateClearButton();


            displayAppointments(
                getFilteredAppointments()
            );

        }
    );


    if (clearSearchBtn) {

        clearSearchBtn.addEventListener(
            "click",
            function () {

                searchInput.value = "";

                currentSearch = "";

                updateClearButton();

                displayAppointments(
                    getFilteredAppointments()
                );

                searchInput.focus();

            }
        );

    }

}


/* =====================================================
   SEARCH CLEAR BUTTON
===================================================== */

function updateClearButton() {

    if (!clearSearchBtn) {
        return;
    }


    clearSearchBtn.style.display =
        currentSearch
            ? "flex"
            : "none";

}


/* =====================================================
   STATUS EVENTS
===================================================== */

function addStatusEvents() {

    const selects =
        document.querySelectorAll(
            ".status-select"
        );


    selects.forEach(
        function (select) {

            select.addEventListener(
                "change",
                async function () {

                    const appointmentId =
                        this.dataset.id;

                    const newStatus =
                        this.value;


                    await updateAppointmentStatus(
                        appointmentId,
                        newStatus
                    );

                }
            );

        }
    );

}


/* =====================================================
   UPDATE STATUS
===================================================== */

async function updateAppointmentStatus(
    appointmentId,
    status
) {

    try {

        const response =
            await fetch(
                `http://localhost:3000/api/appointments/${appointmentId}/status`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        status: status
                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "تعذر تحديث حالة الموعد"
            );

        }


        alert(
            "تم تحديث حالة الموعد بنجاح"
        );


        await loadAppointments();


    } catch (error) {

        console.error(
            "Status update error:",
            error
        );


        alert(
            "تعذر تحديث حالة الموعد"
        );


        await loadAppointments();

    }

}


/* =====================================================
   STATUS TEXT
===================================================== */

function getStatusText(status) {

    switch (status) {

        case "confirmed":
            return "مؤكد";

        case "completed":
            return "مكتمل";

        case "cancelled":
            return "ملغي";

        case "new":
        default:
            return "جديد";

    }

}


/* =====================================================
   FILTER EVENTS
===================================================== */

function addFilterEvents() {

    const filterButtons =
        document.querySelectorAll(
            ".filter-btn"
        );


    filterButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    currentFilter =
                        this.dataset.status;


                    filterButtons.forEach(
                        function (btn) {

                            btn.classList.remove(
                                "active"
                            );

                        }
                    );


                    this.classList.add(
                        "active"
                    );


                    displayAppointments(
                        getFilteredAppointments()
                    );

                }
            );

        }
    );

}


/* =====================================================
   DATE
===================================================== */

function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }


    const parts =
        String(dateString).split("-");


    if (parts.length !== 3) {
        return dateString;
    }


    return `${parts[2]}/${parts[1]}/${parts[0]}`;

}


/* =====================================================
   CREATED AT
===================================================== */

function formatCreatedAt(dateTime) {

    if (!dateTime) {
        return "-";
    }


    return escapeHTML(dateTime);

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =====================================================
   REFRESH
===================================================== */

refreshBtn.addEventListener(
    "click",
    async function () {

        const originalText =
            refreshBtn.innerHTML;


        refreshBtn.disabled = true;

        refreshBtn.innerHTML =
            "⏳ جاري التحديث...";


        await loadAppointments();


        refreshBtn.disabled = false;

        refreshBtn.innerHTML =
            originalText;

    }
);


/* =====================================================
   DELETE
===================================================== */

function addDeleteEvents() {

    const deleteButtons =
        document.querySelectorAll(
            ".delete-btn"
        );


    deleteButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                async function () {

                    const appointmentId =
                        this.dataset.id;


                    const confirmed =
                        confirm(
                            "هل أنت متأكد من حذف هذا الموعد؟"
                        );


                    if (!confirmed) {
                        return;
                    }


                    try {

                        const response =
                            await fetch(
                                `http://localhost:3000/api/appointments/${appointmentId}`,
                                {
                                    method: "DELETE"
                                }
                            );


                        const data =
                            await response.json();


                        if (
                            !response.ok ||
                            !data.success
                        ) {

                            throw new Error(
                                data.message ||
                                "تعذر حذف الموعد"
                            );

                        }


                        alert(
                            "تم حذف الموعد بنجاح"
                        );


                        await loadAppointments();


                    } catch (error) {

                        console.error(
                            "Delete error:",
                            error
                        );


                        alert(
                            "تعذر حذف الموعد"
                        );

                    }

                }
            );

        }
    );

}


/* =====================================================
   EDIT MODAL
===================================================== */

const editModal =
    document.getElementById("editModal");

const closeModal =
    document.getElementById("closeModal");

const cancelEdit =
    document.getElementById("cancelEdit");

const editForm =
    document.getElementById("editForm");

const editId =
    document.getElementById("editId");

const editName =
    document.getElementById("editName");

const editPhone =
    document.getElementById("editPhone");

const editService =
    document.getElementById("editService");

const editDate =
    document.getElementById("editDate");

const editMessage =
    document.getElementById("editMessage");


/* =====================================================
   EDIT EVENTS
===================================================== */

function addEditEvents() {

    const editButtons =
        document.querySelectorAll(
            ".edit-btn"
        );


    editButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const appointmentId =
                        Number(
                            this.dataset.id
                        );


                    const appointment =
                        allAppointments.find(
                            function (item) {

                                return (
                                    Number(item.id) ===
                                    appointmentId
                                );

                            }
                        );


                    if (!appointment) {
                        return;
                    }


                    editId.value =
                        appointment.id;

                    editName.value =
                        appointment.name || "";

                    editPhone.value =
                        appointment.phone || "";

                    editService.value =
                        appointment.service || "";

                    editDate.value =
                        appointment.date || "";

                    editMessage.value =
                        appointment.message || "";


                    editModal.classList.add(
                        "show"
                    );

                }
            );

        }
    );

}


/* =====================================================
   CLOSE EDIT MODAL
===================================================== */

function closeEditModal() {

    editModal.classList.remove(
        "show"
    );

}


closeModal.addEventListener(
    "click",
    closeEditModal
);


cancelEdit.addEventListener(
    "click",
    closeEditModal
);


editModal.addEventListener(
    "click",
    function (event) {

        if (event.target === editModal) {

            closeEditModal();

        }

    }
);


/* =====================================================
   SAVE EDIT
===================================================== */

editForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const appointmentId =
            editId.value;


        const updatedAppointment = {

            name:
                editName.value.trim(),

            phone:
                editPhone.value.trim(),

            service:
                editService.value,

            date:
                editDate.value,

            message:
                editMessage.value.trim()

        };


        try {

            const response =
                await fetch(
                    `http://localhost:3000/api/appointments/${appointmentId}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                updatedAppointment
                            )
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "تعذر تعديل الموعد"
                );

            }


            alert(
                "تم تعديل الموعد بنجاح"
            );


            closeEditModal();


            await loadAppointments();


        } catch (error) {

            console.error(
                "Update error:",
                error
            );


            alert(
                "تعذر تعديل الموعد"
            );

        }

    }
);


/* =====================================================
   ADD APPOINTMENT
===================================================== */

const addAppointmentBtn =
    document.getElementById(
        "addAppointmentBtn"
    );

const addModal =
    document.getElementById(
        "addModal"
    );

const closeAddModal =
    document.getElementById(
        "closeAddModal"
    );

const cancelAdd =
    document.getElementById(
        "cancelAdd"
    );

const addForm =
    document.getElementById(
        "addForm"
    );


addAppointmentBtn.addEventListener(
    "click",
    function () {

        addForm.reset();

        addModal.classList.add(
            "show"
        );

    }
);


/* =====================================================
   CLOSE ADD MODAL
===================================================== */

function closeAddAppointmentModal() {

    addModal.classList.remove(
        "show"
    );

}


closeAddModal.addEventListener(
    "click",
    closeAddAppointmentModal
);


cancelAdd.addEventListener(
    "click",
    closeAddAppointmentModal
);


addModal.addEventListener(
    "click",
    function (event) {

        if (event.target === addModal) {

            closeAddAppointmentModal();

        }

    }
);


/* =====================================================
   ADD APPOINTMENT SUBMIT
===================================================== */

addForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const newAppointment = {

            name:
                document
                    .getElementById("addName")
                    .value
                    .trim(),

            phone:
                document
                    .getElementById("addPhone")
                    .value
                    .trim(),

            service:
                document
                    .getElementById("addService")
                    .value,

            date:
                document
                    .getElementById("addDate")
                    .value,

            message:
                document
                    .getElementById("addMessage")
                    .value
                    .trim()

        };


        try {

            const response =
                await fetch(
                    "http://localhost:3000/api/appointments",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                newAppointment
                            )
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "تعذر إضافة الموعد"
                );

            }


            alert(
                "تم إضافة الموعد بنجاح"
            );


            closeAddAppointmentModal();


            await loadAppointments();


        } catch (error) {

            console.error(
                "Add appointment error:",
                error
            );


            alert(
                "تعذر إضافة الموعد"
            );

        }

    }
);


/* =====================================================
   LOGOUT — OLD SYSTEM
===================================================== */

const logoutBtn =
    document.getElementById(
        "logoutBtn"
    );


logoutBtn.addEventListener(
    "click",
    function () {

        sessionStorage.removeItem(
            "adminLoggedIn"
        );


        window.location.href =
            "../login.html";

    }
);


/* =====================================================
   START
===================================================== */

addFilterEvents();

addSearchEvents();

updateClearButton();

loadAppointments();