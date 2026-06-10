(function (global) {
  const root = globalThis;
  const mapper = root.TramattoNuvemshopMapper || {};

  async function fetchCart(client) {
    const payload = await client.getCart();
    return mapper.mapCart?.(payload) || null;
  }

  async function addCartItem(client, payload) {
    await client.addToCart(payload);
    return fetchCart(client);
  }

  async function removeCartItem(client, lineId) {
    await client.removeFromCart(lineId);
    return fetchCart(client);
  }

  async function updateCartItemQuantity(client, lineId, quantity) {
    await client.updateQuantity(lineId, quantity);
    return fetchCart(client);
  }

  root.TramattoNuvemshopCart = {
    fetchCart,
    addCartItem,
    removeCartItem,
    updateCartItemQuantity
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.TramattoNuvemshopCart;
  }
})(typeof window !== 'undefined' ? window : globalThis);
