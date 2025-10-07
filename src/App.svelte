<script lang="ts">
  import svelteLogo from './assets/svelte.svg';
  import viteLogo from '/vite.svg';
  import Counter from './lib/Counter.svelte';
  import Product from './lib/Product.svelte';
  import { onMount } from 'svelte';

  type ProductType = {
    ID: number;
    product_id: string;
    product_name: string;
    price_buy: number;
    price_sell: number;
    quantity: number;
  };

  let products: ProductType[] = [];
  let isLocalhost = false;
  let loading = true;

  onMount(async () => {
    try {
      const res = await fetch('https://oakapi.onrender.com/products');
      const data = await res.json();
      products = data.products;
    } catch (e) {
      console.error('Failed to fetch products', e);
    } finally {
      loading = false;
    }
  });

  onMount(() => {
    try {
      isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '::1';
    } catch (e) {
      isLocalhost = false;
    }
  });
</script>

<main>
  <div>
    <img src={viteLogo} class="logo" alt="Vite Logo" />
    <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
  </div>
  <h1>OakTrading</h1>

  <div class="card">
    {#if loading}
      <p>Loading products...</p>
    {:else}
      <div class="products-row">
        {#if isLocalhost}
          {#each products as product}
            <Product product={{
              ID: product.ID,
              product_name: product.product_name,
              price_buy: product.price_buy,
              price_sell: product.price_sell,
              quantity: product.quantity
            }} />
          {/each}
        {:else}
          {#each products.filter(p => p.quantity > 0) as product}
            <Product product={{
              ID: product.ID,
              product_name: product.product_name,
              price_buy: product.price_buy,
              price_sell: product.price_sell,
              quantity: product.quantity
            }} />
          {/each}
        {/if}
      </div>
    {/if}
  </div>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
</style>
