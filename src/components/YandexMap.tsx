/**
 * Компонент карты 2ГИС для отображения локаций школы.
 * Использует iframe для встраивания карты.
 */
const Map2GIS = () => {
  return (
    <div className="w-full h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden bg-muted touch-none">
      <iframe
        id="map_831219488"
        frameBorder="0"
        width="100%"
        height="100%"
        src="https://makemap.2gis.ru/widget?data=eJw1jk1PhEAMhv9LvZLNAMPHkHhao9HsYVcPJpo9EKaukwyUDCW6Ev67BbSXJn0_-kxAwWJA-4DUIgeHA1TvE_C1R6jgHmseA0IEfaAeA6_6BA15CqLfqKSMPxLR2bFfEuqpeL7YvVGH4jTwtseXuxOb_Zc6DLditTg0wfXsqJOAHH4eO4vfUMXqf-YILhvQdXn3R3Mk17H4GxJo19W8wqZqp1Uel1GudkqrsszOEndW-tJ8PkfQ1v2RBrf9m8DXDNXm1alRhTZloXUEfpHXsiKLc5PlaWLSTOiIWunKpFS4yfvXT0T_tl45jDj_AlP-YnU"
        allow="geolocation; microphone; camera; fullscreen"
        allowFullScreen
        style={{ border: "none", borderRadius: "0.5rem" }}
        title="Карта локаций школы Вершина"
        loading="lazy"
        aria-label="Интерактивная карта с локациями школы Вершина"
      />
    </div>
  );
};

export default Map2GIS;

