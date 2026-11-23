// moda-enma-tienda/src/app/loading.js — esqueleto mientras carga una página.
export default function Loading() {
  return (
    <section className="wrap py-12" aria-busy="true" aria-label="Cargando">
      <div className="h-10 w-2/3 max-w-[420px] animate-pulse rounded-lg bg-sand" />
      <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="aspect-[3/4] animate-pulse rounded-lg bg-sand" />
            <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-sand" />
            <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-sand" />
          </div>
        ))}
      </div>
    </section>
  );
}
