<script lang="ts">
  import Product from './lib/Product.svelte';
  import { onMount } from 'svelte';

  type ProductType = {
    ID: number;
    product_id: string;
    product_name: string;
    price_buy: number;
    price_sell: number;
    quantity: number;
    image_url?: string;
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
  <h3>Instantly buy and sell items of all types!</h3>

  
  <div class="card">
    {#if loading}
      <p>Loading products...</p>
    {:else}
      <div class="products-row">
        {#each products as product}
          <Product product={{
            ID: product.ID,
            product_id: product.product_id,
            product_name: product.product_name,
            price_buy: product.price_buy,
            price_sell: product.price_sell,
            quantity: product.quantity,
            image_url: product.image_url
          }} />
        {/each}
      </div>
    {/if}
  </div>
</main>