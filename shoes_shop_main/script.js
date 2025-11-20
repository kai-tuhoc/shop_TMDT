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

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Hàm lưu cart vào localStorage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
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
    let ktra = confirm(
      "Bạn mua nhiều số lượng quá , liên hệ với shop để tư vấn nha <3 "
    );
    if (!ktra) {
      // Nếu không đồng ý, xóa sản phẩm
      cart.splice(index, 1);
      alert("rất tiếc , bạn không thể mua hàng của chúng tôi !");
    } else {
      alert(
        "bạn để lại số điện thoại để mình lấy thông tin chốt đơn cho bạn nhá !"
      );
      prompt("mời bạn nhập số điện thoại ");
    }
  }
  renderCart();
}

// Xóa sản phẩm
function removeItem(index) {
  cart.splice(index, 1);
  renderCart();
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
    const toast = document.querySelector(".notify");
    if (toast) {
      const textEl = toast.querySelector(".notify__text");
      if (textEl) textEl.textContent = "Sản phẩm không tồn tại";
      // đảm bảo toast hiển thị (bỏ transform nếu có)
      toast.style.display = "flex";
      toast.style.transform = "translateX(0)";
      clearTimeout(toast._hideTimeout);
      toast._hideTimeout = setTimeout(() => {
        // ẩn và khôi phục nội dung mặc định
        toast.style.transform = "translateX(120%)";
        setTimeout(() => {
          toast.style.display = "none";
          if (textEl) textEl.textContent = "Thêm sản phẩm thành công !";
        }, 300); // allow transform to finish
      }, 2000);
    } else {
      alert("Sản phẩm không tồn tại");
    }
  }
}

// lắng nghe gõ phím (keyup) và Enter
search.addEventListener("keyup", (e) => {
  // nếu nhấn Enter hoặc gõ ký tự mới thì tìm
  if (e.key === "Enter") {
    performSearch();
  } else {
    performSearch();
  }
});

// click vào icon tìm kiếm cũng gọi tìm
const searchIcon = document.querySelector(".header-icon-input");
if (searchIcon) searchIcon.addEventListener("click", performSearch);
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
            <p class="price">${p.price.toLocaleString()}đ</p>
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

  if (currentCategory) {
    productsData[currentCategory].push(newProduct);
    localStorage.setItem("productsData", JSON.stringify(productsData));
  }

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
}
renderAll();

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
    alert("Vui lòng chọn size giày!");
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
