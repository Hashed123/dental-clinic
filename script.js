const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");


/* =========================================================
   MOBILE MENU
========================================================= */

if (menuBtn && navLinks) {

    menuBtn.addEventListener("click", function () {

        navLinks.classList.toggle("active");
        document.body.classList.toggle("menu-open");

        const icon = menuBtn.querySelector("i");

        if (navLinks.classList.contains("active")) {

            icon.classList.remove("fa-bars");
            icon.classList.add("fa-xmark");

        } else {

            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");

        }

    });


    const links = navLinks.querySelectorAll("a");

    links.forEach(function (link) {

        link.addEventListener("click", function () {

            navLinks.classList.remove("active");
            document.body.classList.remove("menu-open");

            const icon = menuBtn.querySelector("i");

            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");

        });

    });

}


/* =========================================================
   NAVBAR ON SCROLL
========================================================= */

const navbar = document.getElementById("navbar");

window.addEventListener("scroll", function () {

    if (!navbar) return;

    if (window.scrollY > 50) {

        navbar.classList.add("scrolled");

    } else {

        navbar.classList.remove("scrolled");

    }

});


/* =========================================================
   CURRENT YEAR
========================================================= */

const yearElement = document.getElementById("year");

if (yearElement) {

    yearElement.textContent = new Date().getFullYear();

}


/* =========================================================
   MINIMUM APPOINTMENT DATE
========================================================= */

const dateInput = document.getElementById("date");

if (dateInput) {

    const today = new Date().toISOString().split("T")[0];

    dateInput.min = today;

}


/* =========================================================
   APPOINTMENT FORM
========================================================= */

const appointmentForm =
    document.getElementById("appointmentForm");


if (appointmentForm) {

    appointmentForm.addEventListener("submit", async function (e) {

        e.preventDefault();


        const name =
            document.getElementById("name").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const service =
            document.getElementById("service").value;

        const date =
            document.getElementById("date").value;

        const message =
            document.getElementById("message").value.trim();


        /* التحقق من البيانات */

        if (!name || !phone || !service || !date) {

            alert("يرجى تعبئة جميع الحقول المطلوبة");

            return;

        }


        const appointmentData = {

            name: name,
            phone: phone,
            service: service,
            date: date,
            message: message

        };


        try {

            /* إرسال البيانات إلى Backend */

            const response = await fetch(
                "http://localhost:3000/api/appointments",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(appointmentData)
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message || "حدث خطأ أثناء حفظ الموعد"
                );

            }


            /* رسالة نجاح */

            alert(
                `تم حجز الموعد بنجاح\nرقم الموعد: ${data.appointmentId}`
            );


            /* =================================================
               إنشاء رسالة واتساب
            ================================================= */

            const whatsappMessage =

                `مرحبًا، أريد حجز موعد في عيادة الدكتور مجدالدين محمد إسماعيل شرف الدين.

الاسم: ${name}
رقم الهاتف: ${phone}
الخدمة: ${service}
التاريخ: ${date}
ملاحظات: ${message || "لا توجد"}`;


            const whatsappURL =

                "https://web.whatsapp.com/send?phone=967775222277&text=" +
                encodeURIComponent(whatsappMessage);


            /* فتح WhatsApp Web */

            window.location.href = whatsappURL;


            /* تفريغ النموذج */

            appointmentForm.reset();


        } catch (error) {

            console.error("Error:", error);

            alert(
                "تعذر حفظ الموعد. تأكد من تشغيل الـ Backend ثم حاول مرة أخرى."
            );

        }

    });

}


/* =========================================================
   GALLERY
========================================================= */

const galleryItems =
    document.querySelectorAll(".gallery-item");

const galleryModal =
    document.getElementById("galleryModal");

const modalImage =
    document.getElementById("modalImage");

const modalClose =
    document.getElementById("modalClose");


galleryItems.forEach(function (item) {

    item.addEventListener("click", function () {

        const image =
            item.querySelector("img");

        if (!image || !galleryModal || !modalImage) {
            return;
        }


        modalImage.src = image.src;

        modalImage.alt = image.alt;


        galleryModal.classList.add("active");

        galleryModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add("menu-open");

    });

});


function closeGallery() {

    if (!galleryModal) return;

    galleryModal.classList.remove("active");

    galleryModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove("menu-open");

}


if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeGallery
    );

}


if (galleryModal) {

    galleryModal.addEventListener(
        "click",
        function (event) {

            if (event.target === galleryModal) {

                closeGallery();

            }

        }
    );

}


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeGallery();

        }

    }
);


/* =========================================================
   SCROLL REVEAL
========================================================= */

const revealElements =
    document.querySelectorAll(
        ".service-card, .review, .feature, .about-grid, .doctor-grid, .gallery-item, .location-grid"
    );


revealElements.forEach(function (element) {

    element.classList.add("reveal");

});


if ("IntersectionObserver" in window) {

    const revealObserver =
        new IntersectionObserver(
            function (entries, observer) {

                entries.forEach(function (entry) {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("show");

                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.12
            }
        );


    revealElements.forEach(function (element) {

        revealObserver.observe(element);

    });

} else {

    revealElements.forEach(function (element) {

        element.classList.add("show");

    });

}


/* =========================================================
   ACTIVE NAVIGATION LINK
========================================================= */

const sections =
    document.querySelectorAll(
        "main section[id]"
    );

const navAnchors =
    document.querySelectorAll(
        ".nav-links a"
    );


window.addEventListener(
    "scroll",
    function () {

        let currentSection = "";


        sections.forEach(function (section) {

            const sectionTop =
                section.offsetTop - 150;

            const sectionHeight =
                section.offsetHeight;


            if (
                window.scrollY >= sectionTop &&
                window.scrollY <
                sectionTop + sectionHeight
            ) {

                currentSection =
                    section.getAttribute("id");

            }

        });


        navAnchors.forEach(function (link) {

            link.classList.remove("active");


            const href =
                link.getAttribute("href");


            if (
                href === "#" + currentSection
            ) {

                link.classList.add("active");

            }

        });

    }
);
 
