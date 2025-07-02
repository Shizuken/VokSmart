// ===== GLOBAL VARIABLES =====
let currentUser = null
const users = JSON.parse(localStorage.getItem("voksmart_users")) || []

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 VokSmart Loading...")
  initializeApp()
  setupEventListeners()
  console.log("✅ VokSmart Ready!")
})

function initializeApp() {
  // Check if user is already logged in
  const savedUser = localStorage.getItem("voksmart_current_user")
  if (savedUser) {
    currentUser = JSON.parse(savedUser)
    updateAuthUI()
  }
  updateBuyButtons()

  // Add demo user for testing
  if (users.length === 0) {
    const demoUser = {
      id: 1,
      name: "Demo User",
      email: "demo@voksmart.com",
      password: "demo123",
      joinDate: new Date().toISOString(),
    }
    users.push(demoUser)
    localStorage.setItem("voksmart_users", JSON.stringify(users))
    console.log("✅ Demo user created: demo@voksmart.com / demo123")
  }
}

function setupEventListeners() {
  // Login form handler
  const loginForm = document.getElementById("loginForm")
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin)
  }

  // Signup form handler
  const signupForm = document.getElementById("signupForm")
  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup)
  }

  // Close modal when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target.classList.contains("modal")) {
      event.target.style.display = "none"
      clearAlerts()
    }
  })

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        const headerHeight = document.querySelector("header").offsetHeight
        const targetPosition = target.offsetTop - headerHeight

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        })
      }
    })
  })

  // Keyboard navigation for modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllModals()
    }
  })

  // Header scroll effect
  window.addEventListener("scroll", handleHeaderScroll)
}

// ===== MODAL FUNCTIONS =====
function openModal(modalId) {
  console.log("Opening modal:", modalId)
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.style.display = "block"
    document.body.style.overflow = "hidden"

    // Focus on first input
    const firstInput = modal.querySelector("input")
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100)
    }
  } else {
    console.error("Modal not found:", modalId)
  }
}

function closeModal(modalId) {
  console.log("Closing modal:", modalId)
  const modal = document.getElementById(modalId)
  if (modal) {
    modal.style.display = "none"
    document.body.style.overflow = "auto"
    clearAlerts()
    clearForms(modalId)
  }
}

function closeAllModals() {
  const modals = document.querySelectorAll(".modal")
  modals.forEach((modal) => {
    modal.style.display = "none"
  })
  document.body.style.overflow = "auto"
  clearAlerts()
}

function switchModal(currentModalId, targetModalId) {
  closeModal(currentModalId)
  setTimeout(() => openModal(targetModalId), 150)
}

function clearForms(modalId) {
  const modal = document.getElementById(modalId)
  if (modal) {
    const form = modal.querySelector("form")
    if (form) {
      form.reset()
    }
  }
}

function clearAlerts() {
  const alerts = document.querySelectorAll(".alert")
  alerts.forEach((alert) => {
    alert.style.display = "none"
    alert.textContent = ""
    alert.className = "alert"
  })
}

// ===== ALERT FUNCTIONS =====
function showAlert(alertId, message, type) {
  const alert = document.getElementById(alertId)
  if (alert) {
    alert.textContent = message
    alert.className = `alert ${type}`
    alert.style.display = "block"

    // Auto hide success alerts
    if (type === "success") {
      setTimeout(() => {
        alert.style.display = "none"
      }, 3000)
    }
  }
}

// ===== AUTHENTICATION FUNCTIONS =====
function handleLogin(e) {
  e.preventDefault()
  console.log("Login attempt...")

  const email = document.getElementById("loginEmail").value.trim()
  const password = document.getElementById("loginPassword").value

  // Basic validation
  if (!email || !password) {
    showAlert("loginAlert", "Mohon isi semua field!", "error")
    return
  }

  // Find user
  const user = users.find((u) => u.email === email && u.password === password)

  if (user) {
    currentUser = user
    localStorage.setItem("voksmart_current_user", JSON.stringify(user))
    showAlert("loginAlert", "Login berhasil! Selamat datang kembali.", "success")

    setTimeout(() => {
      closeModal("loginModal")
      updateAuthUI()
      updateBuyButtons()
      showNotification(`Selamat datang kembali, ${user.name}! 🎉`, "success")

      // If on purchase page, update the display
      if (window.handleLoginSuccess) {
        window.handleLoginSuccess(user)
      }
    }, 1500)
  } else {
    showAlert("loginAlert", "Email atau password salah! Coba lagi.", "error")
  }
}

function handleSignup(e) {
  e.preventDefault()
  console.log("Signup attempt...")

  const name = document.getElementById("signupName").value.trim()
  const email = document.getElementById("signupEmail").value.trim()
  const password = document.getElementById("signupPassword").value
  const confirmPassword = document.getElementById("signupConfirmPassword").value

  // Validation
  if (!name || !email || !password || !confirmPassword) {
    showAlert("signupAlert", "Mohon isi semua field!", "error")
    return
  }

  if (name.length < 2) {
    showAlert("signupAlert", "Nama harus minimal 2 karakter!", "error")
    return
  }

  if (!isValidEmail(email)) {
    showAlert("signupAlert", "Format email tidak valid!", "error")
    return
  }

  if (password.length < 6) {
    showAlert("signupAlert", "Password harus minimal 6 karakter!", "error")
    return
  }

  if (password !== confirmPassword) {
    showAlert("signupAlert", "Password tidak cocok!", "error")
    return
  }

  // Check if email already exists
  if (users.find((u) => u.email === email)) {
    showAlert("signupAlert", "Email sudah terdaftar! Gunakan email lain.", "error")
    return
  }

  // Create new user
  const newUser = {
    id: Date.now(),
    name: name,
    email: email,
    password: password,
    joinDate: new Date().toISOString(),
  }

  users.push(newUser)
  localStorage.setItem("voksmart_users", JSON.stringify(users))

  showAlert("signupAlert", "Pendaftaran berhasil! Silakan login dengan akun baru Anda.", "success")

  setTimeout(() => {
    switchModal("signupModal", "loginModal")
    // Pre-fill email in login form
    document.getElementById("loginEmail").value = email
  }, 2000)
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function updateAuthUI() {
  const authButtons = document.getElementById("authButtons")
  const userProfile = document.getElementById("userProfile")
  const userName = document.getElementById("userName")
  const userAvatar = document.getElementById("userAvatar")

  if (currentUser) {
    authButtons.style.display = "none"
    userProfile.style.display = "flex"
    userName.textContent = currentUser.name
    userAvatar.textContent = currentUser.name.charAt(0).toUpperCase()
    console.log("✅ User logged in:", currentUser.name)
  } else {
    authButtons.style.display = "flex"
    userProfile.style.display = "none"
    console.log("❌ No user logged in")
  }
}

function logout() {
  const confirmLogout = confirm("Apakah Anda yakin ingin keluar?")

  if (confirmLogout) {
    currentUser = null
    localStorage.removeItem("voksmart_current_user")
    updateAuthUI()
    updateBuyButtons()

    showNotification("Anda telah berhasil logout. Terima kasih!", "info")
  }
}

// ===== PRODUCT FUNCTIONS =====
function updateBuyButtons() {
  const buyButtons = document.querySelectorAll(".buy-btn")
  console.log("Updating buy buttons, found:", buyButtons.length)

  buyButtons.forEach((btn) => {
    if (currentUser) {
      btn.disabled = false
      btn.textContent = "Beli Sekarang"
      btn.style.cursor = "pointer"
      btn.style.opacity = "1"
    } else {
      btn.disabled = true
      btn.textContent = "Login untuk Membeli"
      btn.style.cursor = "not-allowed"
      btn.style.opacity = "0.6"
    }
  })
}

function buyProduct(productName, price) {
  if (!currentUser) {
    showNotification("Silakan login terlebih dahulu untuk membeli produk!", "warning")
    setTimeout(() => openModal("loginModal"), 1000)
    return
  }

  const confirmation = confirm(
    `Konfirmasi Pembelian\n\nProduk: ${productName}\nHarga: Rp ${price.toLocaleString("id-ID")}\nPembeli: ${currentUser.name}\n\nLanjutkan pembelian?`,
  )

  if (confirmation) {
    processPurchase(productName, price)
  }
}

function processPurchase(productName, price) {
  // Show loading notification
  showNotification("Memproses pembelian...", "info")

  // Simulate API call delay
  setTimeout(() => {
    // Save purchase to localStorage
    const purchases = JSON.parse(localStorage.getItem("voksmart_purchases")) || []
    const newPurchase = {
      id: Date.now(),
      userId: currentUser.id,
      productName: productName,
      price: price,
      purchaseDate: new Date().toISOString(),
      status: "completed",
    }

    purchases.push(newPurchase)
    localStorage.setItem("voksmart_purchases", JSON.stringify(purchases))

    // Show success message
    const successMessage = `Pembelian berhasil! 🎉\n\nProduk: ${productName}\nHarga: Rp ${price.toLocaleString("id-ID")}\n\nLink download dan invoice akan dikirim ke email ${currentUser.email} dalam 5 menit.\n\nTerima kasih telah berbelanja di VokSmart!`

    alert(successMessage)
    showNotification("Pembelian berhasil! Cek email Anda untuk link download.", "success")
  }, 2000)
}

// ===== UTILITY FUNCTIONS =====
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".notification")
  existingNotifications.forEach((notif) => notif.remove())

  // Create notification element
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `

  // Add styles
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: white;
        border-radius: 10px;
        padding: 15px 20px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        max-width: 350px;
        border-left: 4px solid ${getNotificationColor(type)};
        animation: slideInRight 0.3s ease-out;
    `

  document.body.appendChild(notification)

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.style.animation = "slideOutRight 0.3s ease-in"
      setTimeout(() => notification.remove(), 300)
    }
  }, 5000)
}

function getNotificationIcon(type) {
  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  }
  return icons[type] || icons.info
}

function getNotificationColor(type) {
  const colors = {
    success: "#28a745",
    error: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8",
  }
  return colors[type] || colors.info
}

// ===== CSS ANIMATIONS =====
const style = document.createElement("style")
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #999;
        margin-left: auto;
    }
    
    .notification-close:hover {
        color: #333;
    }
`
document.head.appendChild(style)

// ===== DEVELOPMENT HELPERS =====
if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
  console.log("🚀 VokSmart Development Mode")
  console.log("Demo credentials: demo@voksmart.com / demo123")

  // Add development tools
  window.voksmartDev = {
    getCurrentUser: () => currentUser,
    getAllUsers: () => users,
    getPurchases: () => JSON.parse(localStorage.getItem("voksmart_purchases")) || [],
    clearData: () => {
      localStorage.clear()
      location.reload()
    },
  }
}

function handleHeaderScroll() {
  const header = document.querySelector("header")
  if (window.scrollY > 50) {
    header.classList.add("scrolled")
  } else {
    header.classList.remove("scrolled")
  }
}
