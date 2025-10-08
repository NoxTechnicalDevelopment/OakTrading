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
</script>

<main>
  <h1>OakTrading</h1>
  
  <div class="card">
    {#if loading}
      <p>Loading products...</p>
    {:else}
      <div class="products-row">
        {#each products.filter(p => p.quantity > 0) as product}
          <Product product={{
            ID: product.ID,
            product_id: product.product_id,
            product_name: product.product_name,
            price_buy: product.price_buy,
            price_sell: product.price_sell,
            quantity: product.quantity
          }} />
        {/each}
      </div>
    {/if}
  </div>
</main>