<script lang="ts">
  import { fly } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { fit, parent_style } from '@leveluptuts/svelte-fit'

  export let product: {
    ID: number;
    product_name: string;
    price_buy: number;
    price_sell: number;
    quantity: number;
  };

  let buyHovered = false;
  let sellHovered = false;
  let isLocalhost = false;
  let adminBusy = false;

  let running_quantity = product.quantity;

  onMount(() => {
    try {
      isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '::1';
    } catch (e) {
      isLocalhost = false;
    }
  });

  async function quantity_change(positive : boolean) {
    adminBusy = true;
    running_quantity += positive ? 1 : -1;
    if (running_quantity < 0) running_quantity = 0;
    product.quantity = running_quantity;
    try {
      const res = await fetch('http://localhost:5000/products/' + product.ID, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: running_quantity + 1 })
      });
      const data = await res.json();
      console.log('edit response', data);
    } catch (e) {
      console.error('edit failed', e);
    } finally {
      adminBusy = false;
    }
  }
</script>

<div class="product-card">
  <div class="product-name">
    <div style={parent_style}>
      <h4 use:fit>{product.product_name}</h4>
    </div>
  </div>
  <img class="product-img" src={`/images/products/${product.ID}.webp`} alt={product.product_name} width="200" />

  <div class="product-body">
    <h3 class="product-stock">{#if isLocalhost}<button on:click={() => quantity_change(true)} disabled={adminBusy}>+</button>{/if}<strong>Stock:</strong> {product.quantity} {#if isLocalhost}<button on:click={() => quantity_change(false)} disabled={adminBusy}>-</button>{/if}</h3>
    <div class="product-actions">
      <button class="btn_buy"
        on:mouseenter={() => buyHovered = true}
        on:mouseleave={() => buyHovered = false}
        style="position: relative; overflow: hidden;">
        <!-- sizer stays in flow and sizes the button to the price (hidden visually) -->
        <span class="sizer" aria-hidden="true">{'$' + product.price_buy.toLocaleString()}</span>

        {#if !buyHovered}
          <span class="price" in:fly={{ y: -20, duration: 200 }} out:fly={{ y: 40, duration: 200 }}>
            {'$' + product.price_buy.toLocaleString()}
          </span>
        {:else}
          <span class="label" in:fly={{ y: -40, duration: 200 }} out:fly={{ y: 20, duration: 200 }}>
            Add to Cart
          </span>
        {/if}
      </button>
      <button class="btn_sell"
        on:mouseenter={() => sellHovered = true}
        on:mouseleave={() => sellHovered = false}
        style="position: relative; overflow: hidden;">
        <!-- sizer stays in flow and sizes the button to the price (hidden visually) -->
        <span class="sizer" aria-hidden="true">{'$' + product.price_sell.toLocaleString()}</span>

        {#if !sellHovered}
          <span class="price" in:fly={{ y: -20, duration: 200 }} out:fly={{ y: 40, duration: 200 }}>
            {'$' + product.price_sell.toLocaleString()}
          </span>
        {:else}
          <span class="label" in:fly={{ y: -40, duration: 200 }} out:fly={{ y: 20, duration: 200 }}>
            Sell
          </span>
        {/if}
      </button>
    </div>
  </div>
</div>