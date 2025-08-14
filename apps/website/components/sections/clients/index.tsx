/**
 * Client logos section
 */

const clientCompanies = [
  'Rev Comps',
  'Dream Car Giveaways',
  'Elite Competitions',
  'Lucky Day Competitions',
  'Prestige Prizes',
];

export function ClientsSection() {
  return (
    <section className="py-16 border-y border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-gray-400 mb-8">Trusted by leading UK competition platforms</p>
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-50">
          {clientCompanies.map((company) => (
            <div key={company} className="text-xl font-bold text-gray-500">
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}