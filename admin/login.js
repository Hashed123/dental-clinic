const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");


loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const username =
            document.getElementById("username")
                .value.trim();

        const password =
            document.getElementById("password")
                .value;

        if (!username || !password) {

            loginMessage.textContent =
                "يرجى إدخال اسم المستخدم وكلمة المرور";

            return;
        }

        loginMessage.textContent =
            "جاري تسجيل الدخول...";

        try {

            const response = await fetch(
                "http://localhost:3000/api/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        username: username,
                        password: password
                    })
                }
            );

            const data =
                await response.json();

            if (!response.ok || !data.success) {

                loginMessage.textContent =
                    data.message ||
                    "فشل تسجيل الدخول";

                return;
            }

            loginMessage.textContent =
                "تم تسجيل الدخول بنجاح";
sessionStorage.setItem(
    "adminLoggedIn",
    "true"
);

window.location.href =
    "admin.html";

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            loginMessage.textContent =
                "تعذر الاتصال بالخادم";

        }

    }
);