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
  export let webhookUrl: string = 'https://discord.com/api/webhooks/1425392578798551123/oHZ7ncmoPez4vHoQMjdxLXPQLSovGlcDNRJvl_YOGAcR6yZQ16npGHsSOFFI-8ZFL4E5';

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
  <img class="product-img" src={`/images/products/${product.ID}.webp`} alt={product.product_name} width="200" />

  <div class="product-body">
    <h3 class="product-stock"><strong>Stock:</strong> {product.quantity}</h3>
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

{#if showBuy}
  <BuyModal
    id="buy-dialog"
    product={product}
    webhookUrl={webhookUrl}
    on:close={closeBuy}
    on:submitted={handleBuySubmitted}
  />
{/if}