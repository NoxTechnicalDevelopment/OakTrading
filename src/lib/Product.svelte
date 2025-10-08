<script lang="ts">
  import { fly } from 'svelte/transition';
  import { fit, parent_style } from '@leveluptuts/svelte-fit';
  import BuyModal from './BuyModal.svelte';

  export let product: {
    ID: number;
    product_id: string;
    product_name: string;
    price_buy: number;
    price_sell: number;
    quantity: number;
  };

  /** Set this from the parent or env */
  export let webhookUrl: string = 'https://example.com/your-webhook';

  let buyHovered = false;
  let sellHovered = false;

  let showBuy = false;

  function openBuy() {
    showBuy = true;
  }
  function closeBuy() {
    showBuy = false;
  }

  function handleBuySubmitted() {
    // optional: toast/snackbar or refetch inventory
    showBuy = false;
  }
</script>

<div class="product-card">
  <div class="product-name">
    <div style={parent_style}>
      <h4 use:fit>{product.product_name}</h4>
    </div>
  </div>

  <img
    class="product-img"
    src={`/images/products/${product.ID}.webp`}
    alt={product.product_name}
    width="200"
  />

  <div class="product-body">
    <h3 class="product-stock">
      <strong>Stock:</strong> {product.quantity}
    </h3>

    <div class="product-actions">
      <button
        class="btn_buy"
        on:mouseenter={() => (buyHovered = true)}
        on:mouseleave={() => (buyHovered = false)}
        on:click={openBuy}
        style="position: relative; overflow: hidden;"
        aria-haspopup="dialog"
        aria-controls="buy-dialog"
      >
        <span class="sizer" aria-hidden="true"
          >{'$' + product.price_buy.toLocaleString()}</span
        >

        {#if !buyHovered}
          <span
            class="price"
            in:fly={{ y: -20, duration: 200 }}
            out:fly={{ y: 40, duration: 200 }}
          >
            {'$' + product.price_buy.toLocaleString()}
          </span>
        {:else}
          <span
            class="label"
            in:fly={{ y: -40, duration: 200 }}
            out:fly={{ y: 20, duration: 200 }}
          >
            Buy
          </span>
        {/if}
      </button>

      <button
        class="btn_sell"
        on:mouseenter={() => (sellHovered = true)}
        on:mouseleave={() => (sellHovered = false)}
        style="position: relative; overflow: hidden;"
      >
        <span class="sizer" aria-hidden="true"
          >{'$' + product.price_sell.toLocaleString()}</span
        >

        {#if !sellHovered}
          <span
            class="price"
            in:fly={{ y: -20, duration: 200 }}
            out:fly={{ y: 40, duration: 200 }}
          >
            {'$' + product.price_sell.toLocaleString()}
          </span>
        {:else}
          <span
            class="label"
            in:fly={{ y: -40, duration: 200 }}
            out:fly={{ y: 20, duration: 200 }}
          >
            Sell
          </span>
        {/if}
      </button>
    </div>
  </div>
</div>

{#if showBuy}
  <BuyModal
    id="buy-dialog"
    product={product}
    webhookUrl={webhookUrl}
    on:close={closeBuy}
    on:submitted={handleBuySubmitted}
  />
{/if}

<style>
  /* minimal styles—adapt to your design system */
  .product-card { display: grid; gap: .75rem; padding: 1rem; border-radius: 12px; background: var(--surface, #151515); }
  .product-name h4 { margin: 0; }
  .product-img { border-radius: 10px; object-fit: cover; }
  .product-actions { display: grid; grid-auto-flow: column; gap: .5rem; }
  .btn_buy,.btn_sell {
    position: relative; min-width: 9rem; padding: .75rem 1rem; border: none; border-radius: 10px; cursor: pointer; font-weight: 700;
  }
  .btn_buy { background: #1f8f4e; color: #fff; }
  .btn_sell { background: #7a2732; color: #fff; }
  .sizer { visibility: hidden; height: 0; display: block; }
  .price,.label { position: absolute; left: 0; right: 0; top: 50%; transform: translateY(-50%); text-align: center; }
</style>
