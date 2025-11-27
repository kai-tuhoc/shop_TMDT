const category = document.querySelectorAll(".category p");
// console.log(category)
const section = document.querySelectorAll("section");

window.addEventListener("scroll", () => {
  let current = "";
  section.forEach((section) => {
    const sectionTop = section.offsetTop; // vị trí phần tử so với đầu trang
    if (pageYOffset >= sectionTop - 250) {
      // vij trí đang kéo đến
      current = section.getAttribute("id");
    }
  });

  category.forEach((p) => {
    p.classList.remove("active");
    if (p.id === "content-link" + current.slice(-1)) {
      p.classList.add("active");
    }
  });
});

/////////////////////////
// === CART FUNCTIONALITY === //
const cartIcon = document.querySelector(".buy-icon");
const cartOverlay = document.querySelector("#cart");
const closeCart = document.querySelector(".close-cart");
const cartItemsContainer = document.querySelector(".cart-items");
const cartTotal = document.querySelector("#cart-total");
const checkoutBtn = document.querySelector(".checkout-btn");

// bulk modal elements (for large quantity purchases)
const bulkModal = document.getElementById("bulkModal");
const bulkForm = document.getElementById("bulkForm");
const bulkCancel = document.getElementById("bulkCancel");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Hàm lưu cart vào localStorage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Small toast helper using existing .notify element
function showNotify(text, duration = 2000) {
  const toast = document.querySelector(".notify");
  if (!toast) return;
  const textEl = toast.querySelector(".notify__text");
  if (textEl) textEl.textContent = text;
  toast.style.display = "flex";
  toast.style.transform = "translateX(0)";
  clearTimeout(toast._hideTimeout);
  toast._hideTimeout = setTimeout(() => {
    toast.style.transform = "translateX(120%)";
    setTimeout(() => {
      toast.style.display = "none";
    }, 300);
  }, duration);
}

// Get total quantity helper
function getTotalQuantity() {
  return cart.reduce((sum, it) => {
    const q =
      typeof it.quantity === "number"
        ? it.quantity
        : parseInt(it.quantity) || 0;
    return sum + q;
  }, 0);
}

// Mở / đóng giỏ hàng
cartIcon.addEventListener("click", () => {
  cartOverlay.style.display = "flex";
});

closeCart.addEventListener("click", () => {
  cartOverlay.style.display = "none";
});

// Hiển thị giỏ hàng
function renderCart() {
  cartItemsContainer.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    // Đảm bảo price là số
    const itemPrice =
      typeof item.price === "number" ? item.price : parseInt(item.price) || 0;
    const itemQuantity =
      typeof item.quantity === "number"
        ? item.quantity
        : parseInt(item.quantity) || 1;

    total += itemPrice * itemQuantity;

    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
            <img src="${item.img}" alt="">
            <div class="item-info">
                <h5>${item.name}</h5>
                <p><strong>Giá:</strong> ${itemPrice.toLocaleString()}đ</p>
                <p><strong>Size:</strong> ${item.size || "—"}</p>
                <p><strong>Số lượng:</strong> ${itemQuantity}</p>
            </div>
            <div class="item-quantity">
                <button onclick="changeQuantity(${index}, -1)">-</button>
                <input 
                    class ="input_quantity"
                    type="number" 
                    min="1" 
                    value="${itemQuantity}" 
                    onchange="updateQuantity(${index}, this.value)" 
                    style="width:50px;text-align:center;"
                >
                <button onclick="changeQuantity(${index}, 1)">+</button>
            </div>

            <i class="fa-solid fa-trash" style="cursor:pointer;color:red;font-size:18px;" onclick="removeItem(${index})" title="Xóa sản phẩm"></i>
        `;
    cartItemsContainer.appendChild(div);
  });

  cartTotal.innerText = total.toLocaleString() + "đ";
  saveCart();
}

// Thay đổi số lượng
function changeQuantity(index, change) {
  cart[index].quantity += change;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  renderCart();
}

////////////
function updateQuantity(index, value) {
  const newValue = parseInt(value);
  if (isNaN(newValue) || newValue <= 0) {
    // Nếu nhập số không hợp lệ thì xóa sản phẩm
    cart.splice(index, 1);
  } else {
    cart[index].quantity = newValue;
  }

  if (newValue >= 100) {
    // For large quantities, open the bulk contact form instead of alerts
    // mark bulkConfirmed false until user submits the form
    localStorage.setItem("bulkConfirmed", "false");
    if (bulkModal) bulkModal.style.display = "flex";
    // hide cart/checkout while user fills the bulk form
    if (cartOverlay) cartOverlay.style.display = "none";
    // disable checkout until confirmation
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.style.opacity = 0.5;
    }
    // focus phone input for convenience
    const phoneEl = document.getElementById("bulkPhone");
    if (phoneEl) phoneEl.focus();
  }
  renderCart();
}

// Xóa sản phẩm
function removeItem(index) {
  cart.splice(index, 1);
  renderCart();
}

// Bulk modal handlers (submit / cancel)
if (bulkForm) {
  bulkForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("bulkName").value.trim();
    const phone = document.getElementById("bulkPhone").value.trim();
    const email = document.getElementById("bulkEmail").value.trim();
    if (!name || !phone) {
      showNotify(
        "Vui lòng nhập họ tên và số điện thoại để cửa hàng liên hệ",
        2500
      );
      return;
    }
    const contact = { name, phone, email };
    localStorage.setItem("bulkContact", JSON.stringify(contact));
    localStorage.setItem("bulkConfirmed", "true");
    // close modal, re-open cart so user can continue checkout
    if (bulkModal) bulkModal.style.display = "none";
    if (checkoutBtn) {
      checkoutBtn.disabled = false;
      checkoutBtn.style.opacity = 1;
    }
    if (cartOverlay) cartOverlay.style.display = "flex";
    renderCart();
    showNotify("Cảm ơn! Cửa hàng sẽ liên hệ với bạn để xác nhận đơn hàng.");
  });
}

if (bulkCancel) {
  bulkCancel.addEventListener("click", function () {
    // close modal and keep cart closed; user can reopen cart manually
    if (bulkModal) bulkModal.style.display = "none";
    if (cartOverlay) cartOverlay.style.display = "none";
    // keep checkout disabled until user submits contact info
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.style.opacity = 0.5;
    }
  });
}

// Checkout button behavior: only show bulk modal on checkout if needed
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", function (e) {
    const totalQty = getTotalQuantity();
    const bulkConfirmed = localStorage.getItem("bulkConfirmed") === "true";
    if (totalQty >= 100 && !bulkConfirmed) {
      // hide cart and show bulk modal for confirmation
      if (cartOverlay) cartOverlay.style.display = "none";
      if (bulkModal) bulkModal.style.display = "flex";
      // disable checkout until confirmed
      checkoutBtn.disabled = true;
      checkoutBtn.style.opacity = 0.5;
      return;
    }

    // proceed to checkout (placeholder) - implement real checkout here
    showNotify("Tiếp tục tới thanh toán...");
  });
}

// tìm kiếm
const search = document.querySelector(".header-search_input");
// const productName = document.querySelectorAll(".product-name");
const product_list = document.querySelector(".product-list");
// const search = document.querySelector(".header-search_input");

function performSearch() {
  // cuộn tới khu vực sản phẩm
  const offset =
    product_list.getBoundingClientRect().top + window.pageYOffset - 100;
  window.scrollTo({ top: offset, behavior: "smooth" });

  const input_value = search.value.toLowerCase().trim();
  const allProducts = document.querySelectorAll(".product-card");

  // Nếu input rỗng thì hiện tất cả
  if (!input_value) {
    allProducts.forEach((card) => card.parentElement.classList.remove("fade"));
    return;
  }

  // kiểm tra: tìm kiếm trong tất cả thông tin sản phẩm
  let anyShown = false;
  allProducts.forEach((card) => {
    const nameEl = card.querySelector(".product-name");
    const nameSP = nameEl.textContent.toLowerCase().trim();

    // Lấy tất cả thông tin từ data attributes
    const material = card.dataset.material
      ? card.dataset.material.toLowerCase().trim()
      : "";
    const color = card.dataset.color
      ? card.dataset.color.toLowerCase().trim()
      : "";
    const description = card.dataset.description
      ? card.dataset.description.toLowerCase().trim()
      : "";
    const origin = card.dataset.origin
      ? card.dataset.origin.toLowerCase().trim()
      : "";
    const durability = card.dataset.durability
      ? card.dataset.durability.toLowerCase().trim()
      : "";

    // Kiểm tra xem có khớp với bất kỳ thông tin nào không
    const matched =
      nameSP.includes(input_value) ||
      material.includes(input_value) ||
      color.includes(input_value) ||
      description.includes(input_value) ||
      origin.includes(input_value) ||
      durability.includes(input_value);

    if (matched) {
      card.parentElement.classList.remove("fade");
      anyShown = true;
    } else {
      card.parentElement.classList.add("fade");
    }
  });

  // Nếu không có kết quả nào, hiển thị thông báo nhỏ (dùng .notify)
  if (!anyShown) {
    // show fallback suggestions in dropdown so user can pick alternatives
    renderFallbackSuggestions(input_value);
    showDropdown();
    // also show a non-blocking toast for information
    showNotify("Không tìm thấy sản phẩm, gợi ý một số sản phẩm khác", 2200);
  }
}
// --- Search history and suggestions ---
const searchDropdown = document.querySelector(".search-dropdown");
const historyListEl = document.querySelector(".history-list");
const suggestionListEl = document.querySelector(".suggestion-list");
const clearHistoryBtn = document.querySelector(".clear-history");
const searchIcon = document.querySelector(".header-icon-input");

function loadSearchHistory() {
  return JSON.parse(localStorage.getItem("searchHistory")) || [];
}

function saveSearchHistory(arr) {
  localStorage.setItem("searchHistory", JSON.stringify(arr));
}

function addSearchQueryToHistory(q) {
  if (!q) return;
  const list = loadSearchHistory();
  // avoid duplicates, put latest first
  const normalized = q.toLowerCase().trim();
  const filtered = list.filter((s) => s.toLowerCase() !== normalized);
  filtered.unshift(q);
  const limited = filtered.slice(0, 10);
  saveSearchHistory(limited);
  renderSearchHistory();
}

function renderSearchHistory() {
  const items = loadSearchHistory();
  if (!historyListEl) return;
  historyListEl.innerHTML = "";
  items.forEach((it) => {
    const li = document.createElement("li");
    li.textContent = it;
    li.addEventListener("click", () => {
      search.value = it;
      performSearch();
      hideDropdown();
    });
    historyListEl.appendChild(li);
  });
  // show/hide dropdown depending on whether history exists
  if (items.length > 0) showDropdown();
}

if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener("click", () => {
    localStorage.removeItem("searchHistory");
    renderSearchHistory();
    hideDropdown();
  });
}

function renderSuggestions(query) {
  if (!suggestionListEl) return;
  suggestionListEl.innerHTML = "";
  if (!query) return;
  const q = query.toLowerCase().trim();
  const allCards = Array.from(document.querySelectorAll(".product-card"));
  const matches = allCards
    .map((card) => {
      const name = (
        card.querySelector(".product-name")?.textContent || ""
      ).trim();
      const img = card.querySelector("img")?.src || "";
      const price = card.querySelector(".price")?.textContent || "";
      const text = (
        name +
        " " +
        (card.dataset.material || "") +
        " " +
        (card.dataset.color || "")
      ).toLowerCase();
      const score = text.includes(q)
        ? 1
        : name.toLowerCase().includes(q)
        ? 0.8
        : 0;
      return { card, name, img, price, score };
    })
    .filter((o) => o.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  matches.forEach((m) => {
    const li = document.createElement("li");
    const img = document.createElement("img");
    img.src = m.img;
    const meta = document.createElement("div");
    meta.className = "suggestion-meta";
    meta.innerHTML = `<span class='name'>${m.name}</span><span class='meta'>${m.price}</span>`;
    li.appendChild(img);
    li.appendChild(meta);
    li.addEventListener("click", () => {
      // scroll to product and highlight
      const col = m.card.parentElement;
      if (col) {
        const offset =
          col.getBoundingClientRect().top + window.pageYOffset - 120;
        window.scrollTo({ top: offset, behavior: "smooth" });
        col.classList.add("col-highlight");
        setTimeout(() => col.classList.remove("col-highlight"), 1200);
      }
      hideDropdown();
    });
    suggestionListEl.appendChild(li);
  });
  if (matches.length) showDropdown();
}

// When there are no direct matches, render a set of fallback suggestions
function renderFallbackSuggestions(query) {
  if (!suggestionListEl) return;
  suggestionListEl.innerHTML = "";

  const allCards = Array.from(document.querySelectorAll(".product-card"));
  if (!allCards.length) return;

  // Pick a small list of fallback items: prefer ones that contain any token, otherwise first few
  const qTokens = (query || "").toLowerCase().split(/\s+/).filter(Boolean);

  // Score by token overlap in name/material/color
  const scored = allCards.map((card) => {
    const name = (
      card.querySelector(".product-name")?.textContent || ""
    ).trim();
    const text = (
      name +
      " " +
      (card.dataset.material || "") +
      " " +
      (card.dataset.color || "")
    ).toLowerCase();
    let score = 0;
    qTokens.forEach((t) => {
      if (!t) return;
      if (text.includes(t)) score += 2;
      if (name.toLowerCase().includes(t)) score += 1;
    });
    return {
      card,
      name,
      img: card.querySelector("img")?.src || "",
      price: card.querySelector(".price")?.textContent || "",
      score,
    };
  });

  // sort by score desc, then fallback to first items
  const picks = scored
    .sort((a, b) => b.score - a.score)
    .filter((s) => s)
    .slice(0, 6);

  // If all scores are zero (no token match), just pick first 6
  const nonZero = picks.filter((p) => p.score > 0);
  const final = (nonZero.length ? nonZero : scored.slice(0, 6)).slice(0, 6);

  // Clear any faded highlights for suggested items and highlight them
  // First keep track of columns to re-fade later (if needed)
  final.forEach((m) => {
    const li = document.createElement("li");
    const img = document.createElement("img");
    img.src = m.img;
    const meta = document.createElement("div");
    meta.className = "suggestion-meta";
    meta.innerHTML = `<span class='name'>${m.name}</span><span class='meta'>${m.price}</span>`;
    li.appendChild(img);
    li.appendChild(meta);
    li.addEventListener("click", () => {
      const col = m.card.parentElement;
      if (col) {
        const offset =
          col.getBoundingClientRect().top + window.pageYOffset - 120;
        window.scrollTo({ top: offset, behavior: "smooth" });
        col.classList.add("col-highlight");
        setTimeout(() => col.classList.remove("col-highlight"), 1200);
      }
      hideDropdown();
    });
    suggestionListEl.appendChild(li);

    // visually un-fade that product's column so user sees it in grid
    try {
      const parentCol = m.card.parentElement;
      if (parentCol) parentCol.classList.remove("fade");
    } catch (e) {
      // ignore
    }
  });
}

function showDropdown() {
  if (!searchDropdown) return;
  searchDropdown.style.display = "block";
  searchDropdown.setAttribute("aria-hidden", "false");
}

function hideDropdown() {
  if (!searchDropdown) return;
  searchDropdown.style.display = "none";
  searchDropdown.setAttribute("aria-hidden", "true");
}

// Update behavior: render suggestions while typing, perform full search on Enter or search icon click
search.addEventListener("keyup", (e) => {
  const val = search.value.trim();
  if (e.key === "Enter") {
    if (val) addSearchQueryToHistory(val);
    performSearch();
    hideDropdown();
  } else {
    if (val) {
      renderSuggestions(val);
    } else {
      renderSearchHistory();
    }
  }
});

// click vào icon tìm kiếm cũng gọi tìm
if (searchIcon)
  searchIcon.addEventListener("click", () => {
    const val = search.value.trim();
    if (val) addSearchQueryToHistory(val);
    performSearch();
    hideDropdown();
  });
// THÊM SẢN PHẨM KHI ẤN

// --- MODAL ADD PRODUCT  ---
const modal = document.getElementById("modal");
console.log(modal);
const closeModal = document.getElementById("closeModal");
const openModalButtons = document.querySelectorAll(".openModal");
let currentCategory = null;

openModalButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentCategory = btn.getAttribute("data-category");
    modal.style.display = "flex";
  });
});

// Đóng modal
closeModal.addEventListener("click", () => {
  modal.style.display = "none";
});

// Khi click ra ngoài modal thì ẩn đi
window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

// THÊM SẢN PHẨM  /////////////////////
let productsData = JSON.parse(localStorage.getItem("productsData")) || {
  nam: [],
  nu: [],
  unisex: [],
};

// Migration / validation: if stored data is an array (old format) or missing keys,
// normalize into an object with categories so rendering doesn't break.
if (Array.isArray(productsData)) {
  productsData = { nam: productsData, nu: [], unisex: [] };
  localStorage.setItem("productsData", JSON.stringify(productsData));
}
if (!productsData.nam) productsData.nam = productsData.nam || [];
if (!productsData.nu) productsData.nu = productsData.nu || [];
if (!productsData.unisex) productsData.unisex = productsData.unisex || [];

// Initialize sample products if empty
if (productsData.nam.length === 0) {
  productsData.nam = [
    {
      name: "Giày thể thao Nam 1",
      price: 300000,
      image: "https://via.placeholder.com/220x200?text=Giay+Nam+1",
      material: "Canvas",
      color: "Trắng, Đen",
      description: "Giày thể thao thoải mái và bền",
      origin: "Việt Nam",
      durability: "2-3 năm",
    },
    {
      name: "Giày thể thao Nam 2",
      price: 250000,
      image: "https://via.placeholder.com/220x200?text=Giay+Nam+2",
      material: "Vải",
      color: "Xanh, Trắng",
      description: "Thiết kế hiện đại",
      origin: "Trung Quốc",
      durability: "2 năm",
    },
    {
      name: "Giày thể thao Nam 3",
      price: 280000,
      image: "https://via.placeholder.com/220x200?text=Giay+Nam+3",
      material: "Da nhân tạo",
      color: "Nâu",
      description: "Phù hợp cho công sở",
      origin: "Việt Nam",
      durability: "3 năm",
    },
    {
      name: "Giày thể thao Nam 4",
      price: 320000,
      image: "https://via.placeholder.com/220x200?text=Giay+Nam+4",
      material: "Lưới",
      color: "Xám",
      description: "Thoáng khí, nhẹ",
      origin: "Hàn Quốc",
      durability: "2 năm",
    },
    {
      name: "Giày thể thao Nam 5",
      price: 350000,
      image: "https://via.placeholder.com/220x200?text=Giay+Nam+5",
      material: "Da",
      color: "Đen",
      description: "Cao cấp, bền bỉ",
      origin: "Việt Nam",
      durability: "3-4 năm",
    },
  ];
  localStorage.setItem("productsData", JSON.stringify(productsData));
}

const form = document.getElementById("addForm");
const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const imageInput = document.getElementById("image");
const materialInput = document.getElementById("material");
const colorInput = document.getElementById("color");
const descriptionInput = document.getElementById("description");
const originInput = document.getElementById("origin");
const durabilityInput = document.getElementById("durability");
const productList = document.getElementById("productList");

// hàm hiển thị  sản phẩm
// if()
function renderCategoryProducts(category, containerId) {
  const productList = document.getElementById(containerId);
  productList.innerHTML = "";

  productsData[category].forEach((p, index) => {
    const item = document.createElement("div");
    item.className = "col-lg-3 pos-re";
    const materialText = p.material ? p.material : "";
    const colorText = p.color ? p.color : "";
    const descriptionText = p.description
      ? p.description.substring(0, 50) + "..."
      : "";
    const originText = p.origin ? p.origin : "";
    // ensure price is a number before calling toLocaleString
    const priceNum = Number(p.price) || 0;
    item.innerHTML = `
        <div class="product-card" data-material="${materialText}" data-color="${colorText}" 
             data-description="${p.description || ""}" data-origin="${
      p.origin || ""
    }" data-durability="${p.durability || ""}">
            <div><button class="delete" data-category="${category}" data-index="${index}">×</button></div>
            <img src="${p.image}" alt="${p.name}">
            <div class="product-overlay">
                <p><strong>Chất liệu:</strong> ${materialText || "—"}</p>
                <p><strong>Màu:</strong> ${colorText || "—"}</p>
                ${
                  originText
                    ? `<p><strong>Xuất xứ:</strong> ${originText}</p>`
                    : ""
                }
                ${
                  descriptionText
                    ? `<p><strong>Mô tả:</strong> ${descriptionText}</p>`
                    : ""
                }
            </div>
            <h3 class="product-name">${p.name}</h3>
            <p class="price">${priceNum.toLocaleString()}đ</p>
            <button class="button">Thêm vào giỏ</button>
        </div>
        `;
    productList.appendChild(item);
  });
}

// NOTE: add-to-cart via product buttons is handled by the detail modal.
// Clicking the product card or its "Thêm vào giỏ" button will open the
// product detail modal so user can choose size and confirm.
// hàm thêm sản phẩm
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const newProduct = {
    name: nameInput.value,
    price: Number(priceInput.value),
    image: imageInput.value,
    material: materialInput ? materialInput.value : "",
    color: colorInput ? colorInput.value : "",
    description: descriptionInput ? descriptionInput.value : "",
    origin: originInput ? originInput.value : "",
    durability: durabilityInput ? durabilityInput.value : "",
  };

  // If for some reason currentCategory is not set, default to 'nam' and warn
  const targetCategory = currentCategory || "nam";
  if (!currentCategory) {
    console.warn(
      "currentCategory was not set when adding product — defaulting to 'nam'."
    );
    showNotify("Chưa chọn danh mục — lưu vào Giày Nam (mặc định)");
  }
  productsData[targetCategory].push(newProduct);
  localStorage.setItem("productsData", JSON.stringify(productsData));

  form.reset();
  renderAll();
  modal.style.display = "none"; //  đóng modal sau khi th
});

// hàm xóa sản phẩm
function deleteProduct(category, index, event) {
  event.stopPropagation();
  if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
    productsData[category].splice(index, 1);
    localStorage.setItem("productsData", JSON.stringify(productsData));
    renderAll();
  }
}

function renderAll() {
  renderCategoryProducts("nam", "productList"); // Giày Nam
  renderCategoryProducts("nu", "productListNu"); // Giày Nữ
  renderCategoryProducts("unisex", "productListUnisex"); // Giày Unisex
  attachDeleteEvents();
  updateDeleteButtonVisibility();
  // update carousel content whenever product lists change
  try {
    populateCarouselItems();
  } catch (e) {
    // ignore in older pages
  }
  // initialize or refresh the nam (male) horizontal carousel
  try {
    initNamCarousel();
  } catch (e) {
    // ignore
  }
}
renderAll();

// ----------------- Continuous Carousel -----------------
const carousel = document.getElementById("productCarousel");
const carouselTrack = document.querySelector(".carousel-track");
let carouselPaused = false;
let carouselSpeed = 60; // pixels per second
let carouselPos = 0;
let carouselWidth = 0;
let lastFrame = null;

function createCarouselItem(p) {
  const item = document.createElement("div");
  item.className = "carousel-item";
  const imgSrc = p.image || (p.img ? p.img : "asset/img/giaynam1.jpg");
  const priceNum = Number(p.price) || 0;
  item.innerHTML = `
    <img src="${imgSrc}" alt="${p.name}">
    <div class="ci-body">
      <div class="ci-name">${p.name}</div>
      <div class="ci-price">${priceNum.toLocaleString()}đ</div>
    </div>
  `;
  return item;
}

function populateCarouselItems() {
  if (!carouselTrack) return;
  // collect all products from categories
  const all = [];
  ["nam", "nu", "unisex"].forEach((cat) => {
    const arr = productsData[cat] || [];
    arr.forEach((p) => all.push(p));
  });

  // if no products, hide carousel
  if (!all.length) {
    if (carousel) carousel.style.display = "none";
    return;
  }
  if (carousel) carousel.style.display = "block";

  // clear existing
  carouselTrack.innerHTML = "";

  // create items and append two copies for seamless loop
  const items = all.map(createCarouselItem);
  items.forEach((it) => carouselTrack.appendChild(it));
  items.forEach((it) => carouselTrack.appendChild(it.cloneNode(true)));

  // compute width after append
  requestAnimationFrame(() => {
    carouselWidth = carouselTrack.scrollWidth / 2; // half because duplicated
    // reset animation state
    carouselPos = 0;
    lastFrame = null;
  });
}

function carouselStep(ts) {
  if (!lastFrame) lastFrame = ts;
  const dt = ts - lastFrame;
  lastFrame = ts;
  if (!carouselPaused && carouselWidth > 0) {
    carouselPos -= (carouselSpeed * dt) / 1000;
    if (Math.abs(carouselPos) >= carouselWidth) {
      // reset to 0 for seamless loop
      carouselPos = 0;
    }
    if (carouselTrack)
      carouselTrack.style.transform = `translateX(${carouselPos}px)`;
  }
  requestAnimationFrame(carouselStep);
}

// pause on hover
if (carousel) {
  carousel.addEventListener("mouseenter", () => (carouselPaused = true));
  carousel.addEventListener("mouseleave", () => (carouselPaused = false));
}

// init carousel on load
try {
  populateCarouselItems();
  requestAnimationFrame(carouselStep);
} catch (e) {
  // ignore
}

// ---------------- Nam horizontal carousel (Giày Nam) ----------------
let namTrack = null;
let namTrackWidth = 0;
let namPos = 0;
let namLast = null;
let namPaused = false;
let namAnimationId = null;
const namContainer = document.getElementById("productList");
const namSpeed = 70; // pixels/sec

function initNamCarousel() {
  if (!namContainer) return;
  // find or create track wrapper
  namTrack = namContainer.querySelector(".nam-track");
  // move existing children into the track if track doesn't exist
  if (!namTrack) {
    const track = document.createElement("div");
    track.className = "nam-track";
    // move current child nodes (col-lg-3) into track
    while (namContainer.firstChild) {
      track.appendChild(namContainer.firstChild);
    }
    namContainer.appendChild(track);
    namTrack = track;

    // hover pause - add only once
    namContainer.addEventListener("mouseenter", () => (namPaused = true));
    namContainer.addEventListener("mouseleave", () => (namPaused = false));

    // start animation loop only once
    if (!namAnimationId) {
      namAnimationId = requestAnimationFrame(namStep);
    }
  }

  // if no items, hide
  if (!namTrack.children.length) {
    namContainer.style.display = "";
    return;
  }

  // ensure we have duplicates for seamless looping
  // collect original items (without duplicates)
  const allItems = Array.from(namTrack.children);
  const halfway = allItems.length / 2;
  const originalItems = allItems.slice(0, Math.floor(halfway));

  if (originalItems.length === 0) return;

  // rebuild: keep originals and add clones
  namTrack.innerHTML = "";
  originalItems.forEach((it) => namTrack.appendChild(it));
  originalItems.forEach((it) => namTrack.appendChild(it.cloneNode(true)));

  // compute width
  requestAnimationFrame(() => {
    namTrackWidth = namTrack.scrollWidth / 2;
    namPos = 0;
    namLast = null;
  });
}
function namStep(ts) {
  if (!namLast) namLast = ts;
  const dt = ts - namLast;
  namLast = ts;
  if (!namPaused && namTrackWidth > 0) {
    namPos -= (namSpeed * dt) / 1000;
    if (Math.abs(namPos) >= namTrackWidth) namPos = 0;
    if (namTrack) namTrack.style.transform = `translateX(${namPos}px)`;
  }
  requestAnimationFrame(namStep);
}

function attachDeleteEvents() {
  const deleteButtons = document.querySelectorAll(".delete");
  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation(); // 🔥 chặn click lan lên document (modal sẽ KHÔNG mở)
      const category = btn.dataset.category;
      const index = btn.dataset.index;

      if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
        productsData[category].splice(index, 1);
        localStorage.setItem("productsData", JSON.stringify(productsData));
        renderAll();
      }
    });
  });
}

function updateDeleteButtonVisibility() {
  const deleteButtons = document.querySelectorAll(".delete");
  const isAdmin = localStorage.getItem("btn_test") === "true";
  deleteButtons.forEach((btn) => {
    btn.style.display = isAdmin ? "block" : "none";
  });
}

// admin
const admin = document.querySelector(".header__btn-admin");
let btn_test = localStorage.getItem("btn_test") === "true";

// Update UI khi page load
function initAdminMode() {
  const btn_add = document.querySelectorAll(".btn-add");
  if (btn_test) {
    admin.textContent = "Admin";
    btn_add.forEach((child) => {
      child.style.display = "block";
    });
  } else {
    admin.textContent = "Khách";
    btn_add.forEach((child) => {
      child.style.display = "none";
    });
  }
  updateDeleteButtonVisibility();
}
initAdminMode();

admin.addEventListener("click", () => {
  btn_test = !btn_test;
  localStorage.setItem("btn_test", btn_test);

  const btn_add = document.querySelectorAll(".btn-add");

  if (btn_test) {
    admin.textContent = "Admin";
    btn_add.forEach((child) => {
      child.style.display = "block";
    });
  } else {
    admin.textContent = "Khách";
    btn_add.forEach((child) => {
      child.style.display = "none";
    });
  }

  updateDeleteButtonVisibility();
});

//  phần size sản phẩm
// -------------------- PRODUCT DETAIL MODAL --------------------
const detailModal = document.getElementById("productDetailModal");
const detailImage = document.getElementById("detailImage");
const detailName = document.getElementById("detailName");
const detailPrice = document.getElementById("detailPrice");
const sizeButtonsContainer = document.getElementById("sizeButtons");
const addToCartBtn = document.getElementById("addToCartBtn");
const closeDetail = document.querySelector(".close-detail");

let selectedProduct = null;
let selectedSize = null;

// Hiển thị modal khi click vào sản phẩm (bỏ qua khi click nút 'Thêm vào giỏ' hoặc 'X')
document.addEventListener("click", function (e) {
  const clickedAddBtn = e.target.closest(".button");
  const clickedDelete = e.target.closest(".delete");
  const card = e.target.closest(".product-card");

  if (card && !clickedDelete) {
    const img = card.querySelector("img").src;
    const name = card.querySelector("h3").textContent;
    const priceEl = card.querySelector(".price");
    const price = priceEl ? priceEl.textContent : "0đ";
    const material = card.dataset.material || "";
    const color = card.dataset.color || "";
    const description = card.dataset.description || "";
    const origin = card.dataset.origin || "";
    const durability = card.dataset.durability || "";

    // normalize price (numeric) for cart operations
    const priceNum = parseInt(price.replace(/[^\d]/g, "")) || 0;

    selectedProduct = {
      img,
      name,
      price,
      priceNum,
      material,
      color,
      description,
      origin,
      durability,
    };

    detailImage.src = img;
    detailName.textContent = name;
    detailPrice.textContent = price;
    // hiển thị material & color
    const detailMaterialEl = document.getElementById("detailMaterial");
    const detailColorEl = document.getElementById("detailColor");
    const detailDescriptionEl = document.getElementById("detailDescription");
    const detailOriginEl = document.getElementById("detailOrigin");
    const detailDurabilityEl = document.getElementById("detailDurability");

    if (detailMaterialEl)
      detailMaterialEl.textContent = material ? `Chất liệu: ${material}` : "";
    if (detailColorEl) detailColorEl.textContent = color ? `Màu: ${color}` : "";
    if (detailDescriptionEl)
      detailDescriptionEl.textContent = description
        ? `Mô tả: ${description}`
        : "";
    if (detailOriginEl)
      detailOriginEl.textContent = origin ? `Xuất xứ: ${origin}` : "";
    if (detailDurabilityEl)
      detailDurabilityEl.textContent = durability
        ? `Độ bền: ${durability}`
        : "";

    selectedSize = null; // reset

    // Tạo các nút size
    const sizes = [26, 27, 28, 29, 30, 31, 32, 33, 34];
    sizeButtonsContainer.innerHTML = "";
    sizes.forEach((size) => {
      const btn = document.createElement("button");
      btn.textContent = size;
      btn.addEventListener("click", () => {
        document
          .querySelectorAll("#sizeButtons button")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        selectedSize = size;
      });
      sizeButtonsContainer.appendChild(btn);
    });

    detailModal.style.display = "flex";
  }
});

// Đóng modal chi tiết
closeDetail.addEventListener("click", () => {
  detailModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === detailModal) {
    detailModal.style.display = "none";
  }
});

// Khi ấn "Thêm vào giỏ hàng"
addToCartBtn.addEventListener("click", () => {
  if (!selectedSize) {
    showNotify("Vui lòng chọn size giày!", 2000);
    return;
  }

  // Thêm vào danh sách giỏ hàng dùng biến `cart` và cập nhật hiển thị
  const item = {
    name: selectedProduct.name,
    price: selectedProduct.priceNum || 0,
    img: selectedProduct.img,
    quantity: 1,
    size: selectedSize,
    material: selectedProduct.material || "",
    color: selectedProduct.color || "",
    description: selectedProduct.description || "",
    origin: selectedProduct.origin || "",
    durability: selectedProduct.durability || "",
  };

  const existing = cart.find(
    (c) => c.name === item.name && c.size === item.size
  );
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push(item);
  }

  renderCart();
  detailModal.style.display = "none";
});

// hiện ra thông báo đã thêm sản phẩm thành công
const button_tb = document.querySelectorAll(".btn_tb");
const notify = document.querySelector(".notify");
button_tb.forEach((child) => {
  child.addEventListener("click", () => {
    notify.style.display = "flex";
    // notify.offsetHeight;
    notify.style.animation =
      " runLeft 0.5s ease forwards , high1 2s ease 2.5s forwards";
    setTimeout(() => {
      notify.style.display = "none";
      notify.style.animation = "";
    }, 2000);
  });
});

// --- View size overlay ---
const viewSizeBtn = document.getElementById("viewSizeBtn");
const sizeOverlay = document.getElementById("sizeOverlay");
const sizeOverlayClose = document.querySelector(".size-overlay-close");

if (viewSizeBtn && sizeOverlay) {
  viewSizeBtn.addEventListener("click", () => {
    sizeOverlay.style.display = "flex";
  });
}

if (sizeOverlayClose) {
  sizeOverlayClose.addEventListener("click", () => {
    sizeOverlay.style.display = "none";
  });
}

// click outside content to close
if (sizeOverlay) {
  sizeOverlay.addEventListener("click", (e) => {
    if (e.target === sizeOverlay) sizeOverlay.style.display = "none";
  });
}

// close overlay with Escape key for convenience
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (sizeOverlay && sizeOverlay.style.display === "flex") {
      sizeOverlay.style.display = "none";
    }
    // also close detail modal if open
    if (detailModal && detailModal.style.display === "flex") {
      detailModal.style.display = "none";
    }
  }
});
