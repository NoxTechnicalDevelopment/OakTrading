<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';

  export let id: string = 'sell-dialog';
  export let product: {
    ID: number;
    product_id: string;
    product_name: string;
    price_buy: number;
    price_sell: number;
    quantity: number;
  };
  // your API base (relay lives here)
  export let apiBase: string = 'https://oakapi.onrender.com';

  const dispatch = createEventDispatcher<{ close: void; submitted: void }>();

  let username = '';
  let qty: number = 1;
  let onConsole = false;

  let loading = false;
  let error: string | null = null;
  let success = false;
  let orderId: string | null = null;

  let firstField: HTMLInputElement | null = null;

  onMount(() => {
    firstField?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        e.stopPropagation();
        dispatch('close');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function validate(): string | null {
    if (!username || username.trim().length < 2) {
      return 'Please enter a valid username (2+ characters).';
    }
    if (!Number.isFinite(qty) || qty < 1) {
      return 'Quantity must be at least 1.';
    }
    // For selling, you might NOT want to cap by store stock; skip that check.
    return null;
  }

  async function submitSell() {
    error = validate();
    if (error) return;

    loading = true;
    success = false;
    orderId = null;

    try {
      const imageUrl = `${location.origin}/images/products/${product.ID}.webp`;

      // Relay to your server (which posts to Discord)
      const res = await fetch(`${apiBase}/webhooks/sell`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          qty,
          on_console: onConsole,
          product_id: product.product_id,
          product_db_id: product.ID,
          product_name: product.product_name,
          unit_price: product.price_sell, // SELL price here
          image_url: imageUrl
        })
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Sell relay failed (${res.status}): ${txt || 'no body'}`);
      }

      if (res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json().catch(() => null);
        if (data?.order_id) orderId = String(data.order_id);
      }

      success = true;

      // If you want to auto-close after a delay, uncomment:
      // setTimeout(() => dispatch('submitted'), 2500);
    } catch (e: any) {
      error = e?.message ?? 'Failed to submit sell request.';
    } finally {
      loading = false;
    }
  }

  function backdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget && !loading) dispatch('close');
  }
</script>

<div class="backdrop" role="presentation" on:click={backdropClick} transition:fade aria-hidden="true">
  <div
    class="dialog"
    role="dialog"
    aria-modal="true"
    aria-labelledby={`${id}-title`}
    aria-describedby={`${id}-desc`}
    id={id}
    in:fly={{ y: 12, duration: 140 }}
    out:fade={{ duration: 120 }}
  >
    <header class="dialog__header">
      <h2 id={`${id}-title`}>Sell {product.product_name}</h2>
      <p id={`${id}-desc`} class="muted">
        Unit sell price: ${product.price_sell.toLocaleString()}
      </p>
    </header>

    <form class="dialog__form" on:submit|preventDefault={submitSell}>
      <label>
        <span>Roblox Display Name</span>
        <input
          bind:this={firstField}
          type="text"
          placeholder="Your in-game name"
          autocomplete="username"
        />
      </label>
      <label>
        <span>Roblox Username</span>
        <input
          bind:this={firstField}
          type="text"
          placeholder="Your Roblox username"
          bind:value={username}
          autocomplete="username"
          required
        />
      </label>

      <label>
        <span>Quantity</span>
        <input
          type="number"
          min="1"
          step="1"
          bind:value={qty}
          inputmode="numeric"
          required
        />
      </label>

      <label class="checkbox">
        <input type="checkbox" bind:checked={onConsole} />
        <span>I'm on console</span>
      </label>

      {#if error}
        <div class="alert error" transition:fade>{error}</div>
      {/if}

      {#if success}
        <div class="alert success" transition:fade>
            Sell request registered!
            {#if orderId}
            <div style="margin-top:.5rem; display:flex; align-items:center; gap:.5rem; flex-wrap:wrap;">
              <span><strong>Order ID:</strong></span>
              <code style="padding:.2rem .45rem; border-radius:6px; background:#0b2316;">{orderId}</code>
              <button
                type="button"
                class="btn ghost"
                on:click={() => orderId && navigator.clipboard?.writeText(orderId)}
                aria-label="Copy order ID"
              >
                Copy
              </button>
            </div>
            <p style="margin-top:.75rem; line-height:1.4;">
              Please post this Order ID on the <strong>OakTrading</strong> Discord post.
              You will be pinged once your order is complete.
            </p>
          {/if}
        </div>
      {/if}

      <div class="dialog__actions">
        <button type="button" class="btn ghost" on:click={() => dispatch('close')} disabled={loading}>
          Close
        </button>
        <button type="submit" class="btn primary" disabled={loading}>
          {#if loading}Submitting…{:else}Submit Sell Request{/if}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: grid; place-items: center; z-index: 1000; padding: 1rem; }
  .dialog { width: 100%; max-width: 480px; background: var(--surface-2, #1b1b1b); color: var(--text, #fff);
    border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,.35); padding: 1rem 1rem 1.25rem; }
  .dialog__header { margin-bottom: .5rem; }
  .muted { color: #a0a0a0; margin: .25rem 0 0; font-size: .9rem; }
  .dialog__form { display: grid; gap: .75rem; }
  label { display: grid; gap: .35rem; font-weight: 600; }
  input[type="text"], input[type="number"] { background: #0f0f0f; color: #fff; border: 1px solid #2b2b2b;
    padding: .6rem .7rem; border-radius: 10px; outline: none; }
  input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.25); }
  .checkbox { display: flex; align-items: center; gap: .55rem; font-weight: 600; }
  .checkbox input { accent-color: #3b82f6; }
  .alert { padding: .6rem .75rem; border-radius: 10px; font-weight: 600; }
  .alert.error { background: #3a1216; border: 1px solid #7a2b36; }
  .alert.success { background: #12361f; border: 1px solid #2b7a4b; }
  .dialog__actions { margin-top: .5rem; display: grid; grid-auto-flow: column; gap: .6rem; justify-content: end; }
  .btn { padding: .65rem 1rem; border-radius: 10px; border: none; font-weight: 700; cursor: pointer; }
  .btn.primary { background: #1f8f4e; color: #fff; }
  .btn.ghost { background: transparent; color: #eaeaea; border: 1px solid #3a3a3a; }
  .btn:disabled { opacity: .6; cursor: not-allowed; }
</style>
