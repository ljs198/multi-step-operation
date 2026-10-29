(function () {
    "use strict";

    // ---------- 数据 ----------
    var PLANS = {
        arcade: { name: "街机", monthly: 9, yearly: 90 },
        advanced: { name: "进阶", monthly: 12, yearly: 120 },
        pro: { name: "专业版", monthly: 15, yearly: 150 }
    };

    var ADDONS = {
        online: { name: "在线服务", monthly: 1, yearly: 10 },
        storage: { name: "更大的存储空间", monthly: 2, yearly: 20 },
        profile: { name: "自定义个人资料", monthly: 2, yearly: 20 }
    };

    // ---------- 状态 ----------
    var state = {
        step: 1,
        billing: "monthly", // "monthly" | "yearly"
        plan: "arcade",
        addons: []
    };

    // ---------- DOM ----------
    var stepSections = document.querySelectorAll(".form-step");
    var stepItems = document.querySelectorAll(".step-item");
    var backBtn = document.getElementById("back-btn");
    var nextBtn = document.getElementById("next-btn");
    var confirmBtn = document.getElementById("confirm-btn");

    var infoForm = document.getElementById("form-info");
    var nameInput = document.getElementById("name");
    var emailInput = document.getElementById("email");
    var phoneInput = document.getElementById("phone");

    var billingSwitch = document.getElementById("billing-switch");
    var billingOptions = document.querySelectorAll(".billing-option");
    var planInputs = document.querySelectorAll('input[name="plan"]');
    var addonInputs = document.querySelectorAll('input[name="addon"]');

    // ---------- 工具 ----------
    function billingSuffix() {
        return state.billing === "yearly" ? "/年" : "/月";
    }

    // ---------- 步骤切换 ----------
    function goToStep(n) {
        state.step = n;

        stepSections.forEach(function (section) {
            section.classList.toggle("is-active", Number(section.dataset.step) === n);
        });

        stepItems.forEach(function (item) {
            item.classList.toggle("is-active", Number(item.dataset.step) === n);
        });

        // 按钮可见性
        backBtn.classList.toggle("hidden", n === 1 || n === 5);
        nextBtn.classList.toggle("hidden", n >= 4);
        confirmBtn.hidden = n !== 4;

        if (n === 4) {
            renderSummary();
        }
    }

    // ---------- 计费/价格渲染 ----------
    function renderPrices() {
        var suffix = billingSuffix();

        // 套餐卡片价格
        document.querySelectorAll(".plan-price").forEach(function (el) {
            var key = el.dataset.plan;
            el.textContent = "$" + PLANS[key][state.billing] + suffix;
        });

        // 年付才显示「2 个月免费」提示
        document.querySelectorAll(".plan-note").forEach(function (note) {
            note.classList.toggle("is-visible", state.billing === "yearly");
        });

        // 附加服务价格
        document.querySelectorAll(".addon-price").forEach(function (el) {
            var key = el.dataset.addon;
            el.textContent = "+$" + ADDONS[key][state.billing] + suffix;
        });
    }

    // ---------- 套餐选中态 ----------
    function renderPlanSelection() {
        planInputs.forEach(function (input) {
            input.closest(".plan-card").classList.toggle("is-selected", input.checked);
        });
        if (document.querySelector('input[name="plan"]:checked')) {
            state.plan = document.querySelector('input[name="plan"]:checked').value;
        }
    }

    // ---------- 附加服务选中态 ----------
    function renderAddonSelection() {
        state.addons = [];
        addonInputs.forEach(function (input) {
            input.closest(".addon-card").classList.toggle("is-selected", input.checked);
            if (input.checked) {
                state.addons.push(input.value);
            }
        });
    }

    // ---------- 计费开关 UI ----------
    function renderBillingUI() {
        billingSwitch.setAttribute("aria-checked", state.billing === "yearly");
        billingOptions.forEach(function (opt) {
            opt.classList.toggle("is-active", opt.dataset.billing === state.billing);
        });
    }

    // ---------- 汇总 ----------
    function renderSummary() {
        var suffix = billingSuffix();
        var plan = PLANS[state.plan];
        var periodText = state.billing === "yearly" ? "按年" : "按月";
        var planPrice = plan[state.billing];
        var total = planPrice;

        document.getElementById("summary-plan-name").textContent =
            plan.name + " (" + periodText + ")";
        document.getElementById("summary-plan-price").textContent =
            "$" + planPrice + suffix;

        var addonsBox = document.getElementById("summary-addons");
        addonsBox.innerHTML = "";

        if (state.addons.length === 0) {
            var empty = document.createElement("p");
            empty.className = "summary-empty";
            empty.textContent = "未选择附加服务";
            addonsBox.appendChild(empty);
        } else {
            state.addons.forEach(function (key) {
                var addon = ADDONS[key];
                var row = document.createElement("div");
                row.className = "summary-addon-row";

                var name = document.createElement("span");
                name.className = "summary-addon-name";
                name.textContent = addon.name;

                var price = document.createElement("span");
                price.className = "summary-addon-price";
                price.textContent = "+$" + addon[state.billing] + suffix;

                row.appendChild(name);
                row.appendChild(price);
                addonsBox.appendChild(row);

                total += addon[state.billing];
            });
        }

        document.getElementById("total-label").textContent =
            state.billing === "yearly" ? "总计（每年）" : "总计（每月）";
        document.getElementById("total-price").textContent =
            "+$" + total + suffix;
    }

    // ---------- 校验 ----------
    function validateInfo() {
        var valid = true;
        var fields = [
            { input: nameInput, key: "name", required: "此项为必填项" },
            { input: emailInput, key: "email", required: "此项为必填项" },
            { input: phoneInput, key: "phone", required: "此项为必填项" }
        ];

        var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        fields.forEach(function (f) {
            var value = f.input.value.trim();
            var errorEl = document.querySelector('[data-error-for="' + f.key + '"]');
            var message = "";

            if (!value) {
                message = f.required;
                valid = false;
            } else if (f.key === "email" && !emailPattern.test(value)) {
                message = "邮箱格式不正确";
                valid = false;
            }

            setFieldError(f.input, errorEl, message);
        });

        return valid;
    }

    function setFieldError(input, errorEl, message) {
        input.closest(".field").classList.toggle("has-error", !!message);
        if (errorEl) {
            errorEl.textContent = message;
        }
    }

    function clearFieldError(input) {
        input.closest(".field").classList.remove("has-error");
        var key = input.name;
        var errorEl = document.querySelector('[data-error-for="' + key + '"]');
        if (errorEl) {
            errorEl.textContent = "";
        }
    }

    // ---------- 事件 ----------
    // 下一步
    nextBtn.addEventListener("click", function () {
        if (state.step === 1) {
            if (!validateInfo()) {
                return;
            }
        }
        if (state.step === 2 && !state.plan) {
            document.querySelector('[data-error-for="plan"]').textContent =
                "请选择套餐";
            return;
        }
        document.querySelector('[data-error-for="plan"]').textContent = "";
        goToStep(state.step + 1);
    });

    // 上一步
    backBtn.addEventListener("click", function () {
        goToStep(state.step - 1);
    });

    // 确认
    confirmBtn.addEventListener("click", function () {
        goToStep(5);
    });

    // 汇总页「Change」返回套餐选择
    document.getElementById("change-plan").addEventListener("click", function () {
        goToStep(2);
    });

    // 套餐选择
    planInputs.forEach(function (input) {
        input.addEventListener("change", function () {
            state.plan = input.value;
            renderPlanSelection();
        });
    });

    // 附加服务
    addonInputs.forEach(function (input) {
        input.addEventListener("change", function () {
            renderAddonSelection();
        });
    });

    // 计费开关
    billingSwitch.addEventListener("click", function () {
        state.billing = state.billing === "monthly" ? "yearly" : "monthly";
        renderBillingUI();
        renderPrices();
        renderSummary();
    });

    billingOptions.forEach(function (opt) {
        opt.addEventListener("click", function () {
            if (state.billing === opt.dataset.billing) {
                return;
            }
            state.billing = opt.dataset.billing;
            renderBillingUI();
            renderPrices();
            renderSummary();
        });
    });

    // 输入时清除错误提示
    [nameInput, emailInput, phoneInput].forEach(function (input) {
        input.addEventListener("input", function () {
            clearFieldError(input);
        });
    });

    // ---------- 初始化 ----------
    renderPlanSelection();
    renderAddonSelection();
    renderBillingUI();
    renderPrices();
    goToStep(1);
})();