let isCartOpen = false;
let cartItems = [];

function toggleCart() {
  let cartSidebar = document.getElementById("cart-sidebar");
  cartSidebar.classList.toggle("hidden");
  isCartOpen = !isCartOpen;
}

fetch("../assets/items.json")
  .then((res) => res.json())
  .then((data) => {
    let cards = "";
    data.forEach((item) => {
      cards += `
        <div class="food-item card bg-gray-100 w-80 rounded-lg relative" data-id="${item?.id}" data-img="${item?.img}" data-name="${item?.name}" data-price="${item?.price}">
          ${item?.badge ? `<div class="badge bg-[#ff5100] text-white p-4 font-bold uppercase absolute -top-4 -left-6 -rotate-45">${item.badge}</div>` : ""}
          <figure class="px-4 pt-4"><img src="./media/${item?.img}" alt="${item?.name}" /></figure>
          <div class="card-body px-4 py-4">
            <h2 class="card-title text-2xl">${item?.name}</h2>
            <p class="text-xs text-gray-500 font-bold -mt-2 mb-3">${item.price}</p>
            <p class="text-base text-justify">${item?.description.slice(0, 115)}...</p>
            <div class="card-actions">
              <button class="btn btn-sm bg-[#ff5100] text-white w-full hover:bg-[#cd4403] addCart" data-id="${item?.id}">Add To Order</button>
              <button class="btn btn-sm border-2 border-[#ff5100] text-[#ff5100] bg-white hover:bg-white hover:border-[#cd4403] hover:text-[#cd4403] w-full">Customize</button>
            </div>
          </div>
        </div>`;
    });
    document.getElementById("items").innerHTML = cards;
    initCart();
  });

function initCart() {
  document.querySelectorAll(".addCart").forEach((button) => {
    button.addEventListener("click", function () {
      let card = this.closest(".food-item");
      let itemId = card.dataset.id;
      let itemImg = card.dataset.img;
      let itemName = card.dataset.name;
      let itemPrice = parseFloat(card.dataset.price);
      let existingItemIndex = cartItems.findIndex((item) => item.id === itemId);

      if (existingItemIndex > -1) {
        cartItems[existingItemIndex].quantity += 1;
      } else {
        cartItems.push({id: itemId, img: itemImg, name: itemName, price: itemPrice, quantity: 1});
        this.disabled = true;
      }

      renderCart();
      if (!isCartOpen) {
        toggleCart();
      }
      updateTotalPrice();
      updateCartDataCount();
    });
  });
}

function renderCart() {
  let carts = document.getElementById("cartItems");
  carts.innerHTML = "";

  cartItems.forEach((item) => {
    carts.innerHTML += `
      <div class="card card-compact card-side border-2 p-2 mb-3 rounded-lg border-white relative">
        <div data-id="${item?.id}" class="remove-item badge bg-white py-3 px-2 rounded-md absolute -top-2 -right-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4 text-red-500">
            <path
              fill-rule="evenodd"
              d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z"
              clip-rule="evenodd" />
          </svg>
        </div>
        <figure><img src="./media/${item?.img}" alt="${item?.name}" class="h-full w-20 md:w-28 lg:w-32 rounded-lg" /></figure>
        <div class="card-body text-white">
          <h2 class="card-title text-2xl -mt-2">${item?.name}</h2>
          <p class="text-xs font-bold -mt-2 mb-3">${item?.price}$ each</p>
          <div class="flex items-center -mt-3 mb-1">
            <button class="py-1 px-2 bg-gray-300 border-2 border-gray-300 hover:bg-gray-400 text-black" onclick="changeQuantity('${item?.id}', -1)">&minus;</button>
            <span class="w-12 py-1 text-center bg-white border-0 text-black">${item?.quantity}</span>
            <button class="py-1 px-2 bg-gray-300 border-2 border-gray-300 hover:bg-gray-400 text-black" onclick="changeQuantity('${item?.id}', 1)">&#43;</button>
          </div>
        </div>
        <div class="text-white font-bold absolute bottom-1 right-2">
          <p>${item?.price * item?.quantity}$</p>
        </div>
      </div>`;
  });

  document.querySelectorAll(".remove-item").forEach((button) => {
    button.addEventListener("click", function () {
      let itemId = this.dataset.id;
      removeItem(itemId);
      enableAddCartButton(itemId);
    });
  });
}

function removeItem(itemId) {
  let itemIndex = cartItems.findIndex((item) => item.id === itemId);
  if (itemIndex > -1) {
    cartItems.splice(itemIndex, 1);
  }
  renderCart();
  updateTotalPrice();
  updateCartDataCount();
}

function enableAddCartButton(itemId) {
  let button = document.querySelector(`.addCart[data-id="${itemId}"]`);
  if (button) {
    button.disabled = false;
  }
}

function changeQuantity(itemId, change) {
  let item = cartItems.find((item) => item.id === itemId);
  if (item) {
    item.quantity += change;
    if (item.quantity < 1) {
      item.quantity = 1;
    }
    renderCart();
    updateTotalPrice();
  }
}

function updateCartDataCount() {
  let cartDataElements = document.querySelectorAll(".cartData");

  cartDataElements.forEach((element) => {
    element.innerText = cartItems?.length;
  });
}

function updateTotalPrice() {
  let totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  document.getElementById("totalPrice").innerText = totalPrice;
}
