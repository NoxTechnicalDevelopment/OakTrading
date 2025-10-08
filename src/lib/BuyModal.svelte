<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { fade, fly, scale } from 'svelte/transition';

  export let id: string = 'buy-dialog';
  export let product: {
    ID: number;
    product_id: string;
    product_name: string;
    price_buy: number;
    price_sell: number;
    quantity: number;
  };

  type BuyPayload = {
    type: 'buy';
    product_db_id: number;
    product_id: string;
    product_name: string;
    unit_price: number;
    requested_qty: number;
    username: string;
    on_console: boolean;
    timestamp: string;
  };

  const dispatch = createEventDispatcher<{
    close: void;
    submitted: void;
  }>();

  let username = '';
  let qty: number = 1;
  let onConsole = false;
  let orderId: string | null = null;

  let loading = false;
  let error: string | null = null;
  let success = false;

  let firstField: HTMLInputElement | null = null;

  onMount(() => {
    // focus first input when modal opens
    firstField?.focus();

    // close on Escape
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
    if (qty > product.quantity) {
      return `Only ${product.quantity} in stock.`;
    }
    return null;
  }

  // ONLY replace submitBuy
  async function submitBuy() {
  error = validate();
  if (error) return;

  loading = true;
  success = false;
  orderId = null;

  try {
    const imageUrl = `${location.origin}/images/products/${product.ID}.webp`;

    const res = await fetch(`https://oakapi.onrender.com/webhooks/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.trim(),
        qty,
        on_console: onConsole,
        product_id: product.product_id,
        product_db_id: product.ID,
        product_name: product.product_name,
        unit_price: product.price_buy,
        image_url: imageUrl
      })
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Buy relay failed (${res.status}): ${txt || 'no body'}`);
    }

    // Expect JSON with { order_id }
    if (res.headers.get('content-type')?.includes('application/json')) {
      const data = await res.json();
      orderId = (data?.order_id ?? '').toString();
    }

    success = true;
    dispatch('submitted');
  } catch (e: any) {
    error = e?.message ?? 'Failed to submit buy request.';
  } finally {
    loading = false;
  }
}

  function backdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget && !loading) dispatch('close');
  }
</script>

<!-- Backdrop -->
<div
  class="backdrop"
  role="presentation"
  on:click={backdropClick}
  transition:fade
  aria-hidden="true"
>
  <!-- Dialog -->
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
      <h2 id={`${id}-title`}>Buy {product.product_name}</h2>
      <p id={`${id}-desc`} class="muted">
        Unit price: ${product.price_buy.toLocaleString()} • In stock: {product.quantity}
      </p>
    </header>

    <form class="dialog__form" on:submit|preventDefault={submitBuy}>
      <label>
        <span>Username</span>
        <input
          bind:this={firstField}
          type="text"
          placeholder="Your in-game name"
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
          max={product.quantity}
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
          Order registered!
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
              Please send this Order ID on the <strong>OakTrading</strong> Discord posting.  
              We will ping you as soon as we can fuffil your order!
            </p>
          {/if}
        </div>
      {/if}


      <div class="dialog__actions">
        <button type="button" class="btn ghost" on:click={() => dispatch('close')} disabled={loading}>
          Cancel
        </button>
        <button type="submit" class="btn primary" disabled={loading}>
          {#if loading}Submitting…{:else}Submit Buy Request{/if}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,.5);
    display: grid; place-items: center; z-index: 1000;
    padding: 1rem;
  }
  .dialog {
    width: 100%;
    max-width: 480px;
    background: var(--surface-2, #1b1b1b);
    color: var(--text, #fff);
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0,0,0,.35);
    padding: 1rem 1rem 1.25rem;
  }
  .dialog__header { margin-bottom: .5rem; }
  .muted { color: #a0a0a0; margin: .25rem 0 0; font-size: .9rem; }

  .dialog__form { display: grid; gap: .75rem; }
  label { display: grid; gap: .35rem; font-weight: 600; }
  input[type="text"], input[type="number"] {
    background: #0f0f0f; color: #fff; border: 1px solid #2b2b2b;
    padding: .6rem .7rem; border-radius: 10px; outline: none;
  }
  input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.25); }
  .checkbox { display: flex; align-items: center; gap: .55rem; font-weight: 600; }
  .checkbox input { accent-color: #3b82f6; }

  .alert { padding: .6rem .75rem; border-radius: 10px; font-weight: 600; }
  .alert.error { background: #3a1216; border: 1px solid #7a2b36; }
  .alert.success { background: #12361f; border: 1px solid #2b7a4b; }

  .dialog__actions {
    margin-top: .5rem;
    display: grid; grid-auto-flow: column; gap: .6rem; justify-content: end;
  }
  .btn { padding: .65rem 1rem; border-radius: 10px; border: none; font-weight: 700; cursor: pointer; }
  .btn.primary { background: #1f8f4e; color: #fff; }
  .btn.ghost { background: transparent; color: #eaeaea; border: 1px solid #3a3a3a; }
  .btn:disabled { opacity: .6; cursor: not-allowed; }
</style>
