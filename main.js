const RESTAURANT_PHONE = '351932532058';
let cart = [];

// DOM Elements
const cartList = document.getElementById('cart-list');
const totalDisplay = document.getElementById('cart-total');
const notesInput = document.getElementById('order-notes');
const sendBtn = document.getElementById('send-whatsapp-btn');
const nameDisplay = document.getElementById('customer-name');
const pickupTimeSelect = document.getElementById('pickup-time');

// Initialize Event Listeners
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        const itemElement = e.target.closest('.menu-item');
        const name = itemElement.getAttribute('data-name');
        const price = parseFloat(itemElement.getAttribute('data-price'));
        const variantSelect = itemElement.querySelector('.item-variant');
        
        let finalName = name;
        if (variantSelect) {
            if (variantSelect.value === "") {
                alert("Por favor, selecione uma opção.");
                return;
            }
            finalName = `${name} (${variantSelect.value})`;
        }

        addToCart(finalName, price);
    });
});

sendBtn.addEventListener('click', sendOrderViaWhatsApp);

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        // 2. If it exists, just increase the number
        existingItem.quantity += 1;
    }
    else {
        // 3. If it is NEW, you MUST add "quantity: 1" here
        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }
    // 4. Update the screen
    updateCartUI();
}

function updateCartUI() {
    // Clear current list
    cartList.innerHTML = '';

    // 2. THE STARTING POINT: Set totals to zero
    let totalPrice = 0;
    let totalItems = 0;

    // 3. THE LOOP: Process every item in your cart
    cart.forEach((item) => {
        // Create the HTML line for the whiteboard
        const li = document.createElement('li');
        li.className = 'cart-item';

        // Calculate the price for this specific row (Price * Quantity)
        const subtotal = item.price * item.quantity;

        // Write the text for the screen
        li.innerHTML = `
        <span>${item.quantity}x ${item.name} - €${subtotal.toFixed(2)}</span>
        <button class="remove-btn" onclick="removeFromCart('${item.name}')">X</button>
        `;

        // Stick the line onto the whiteboard
        cartList.appendChild(li);

        // Update our running totals
        totalPrice += subtotal;
        totalItems += item.quantity;
    });
    
    // 4. THE UPDATE: Use the "Remote Controls" to change the screen
    totalDisplay.textContent = `€ ${totalPrice.toFixed(2)}`;

    const cartCountDisplay = document.getElementById('cart-item-qt');
    if (cartCountDisplay) {
        cartCountDisplay.textContent = totalItems;
    }

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.textContent = 'Adicionar';
    });

    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach(card => {
        const cardName = card.getAttribute('data-name');

        const totalQtyForCard = cart
        .filter(item => item.name.startsWith(cardName))
        .reduce((sum, item) => sum + item.quantity, 0);

        if (totalQtyForCard > 0) {
            const btn = card.querySelector('.add-to-cart-btn');
            btn.textContent = `Adicionar (${totalQtyForCard})`;
        }
    });
}

function removeFromCart(itemName) {
    // 1. Filter the cart: Keep everything EXCEPT the item we want to delete
    cart = cart.filter(item =>item.name !== itemName);

    // 2. Tell the secretary to redraw the screen
    updateCartUI();
};

function sendOrderViaWhatsApp() {
    if (cart.length === 0) {
        alert('O seu carrinho está vazio!');
        return;
    }

    // 1. Grab data from your HTML elements
    const customerName = document.getElementById('customer-name').value;
    const notes = document.getElementById('order-notes').value;
    const pickupTime = document.getElementById('pickup-time').value;
    const finalTotal = document.getElementById('cart-total').textContent;

    // 2. Start building the message (Notice the SPACE before and after the * for bolding)
    let message = 'DAIYA TAVIRA - NOVO PEDIDO\n\n';

    // Add customer name
    if (customerName.trim() !== "") {
        message += `Cliente: ${customerName}\n`;
    }

    // 4. Loop through items
    cart.forEach(item => {
        const subtotal = (item.price * item.quantity).toFixed(2);
        message += `• *${item.quantity}x* ${item.name} - € ${subtotal}\n`;
    });

    // Add notes
    if (notes.trim() !== "") {
        message += `\nObservações: ${notes} \n\n`;
    }

    // 3. Add pickup time data
    message += `Recolha em: ${pickupTime}\n\n`;

    // 5. Add Total
    message += `Total: ${finalTotal}`;

    // 6. Send it
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${RESTAURANT_PHONE}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}