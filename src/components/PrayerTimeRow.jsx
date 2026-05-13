function PrayerTimeRow({ prayer }) {
  return (
    <button className={prayer.active ? 'prayer-row active' : 'prayer-row'}>
      <span>{prayer.name}</span>
      <strong>{prayer.time}</strong>
    </button>
  );
}

export default PrayerTimeRow;
