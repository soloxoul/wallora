import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { serviceCategories } from "@/lib/services";

export default function ServicesPage() {
  const mainCategories = serviceCategories.filter(
    (category) => !category.parent
  );

  return (
    <section className="section-padding page-container">
      <div className="mb-12 max-w-3xl">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[#687052]">
          Explore Wallora
        </p>

        <h1 className="heading-xl">Services designed around you.</h1>

        <p className="mt-5 text-lg leading-8 text-[#777868]">
          From creative wall designs to complete room decoration, choose the
          space you want to transform.
        </p>
      </div>

      <div className="grid gap-7 md:grid-cols-2">
        {mainCategories.map((category) => (
          <Link
            key={category.slug}
            href={`/services/${category.slug}`}
            className="neu-surface group rounded-[32px] p-4 transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="overflow-hidden rounded-[26px]">
              <img
                src={category.image}
                alt={category.title}
                className="h-72 w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="p-6">
              <h2 className="heading-md">{category.title}</h2>

              <p className="mt-3 leading-7 text-[#777868]">
                {category.description}
              </p>

              <div className="mt-6 flex items-center gap-2 font-semibold text-[#687052]">
                Explore services
                <ArrowRight size={18} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}