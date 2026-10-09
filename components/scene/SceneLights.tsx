export default function SceneLights() {
  return (
    <>
      {/* cool void ambient + warm key from the sun side */}
      <ambientLight intensity={0.35} color="#8fa3c8" />
      <directionalLight position={[5, 4, 6]} intensity={0.8} color="#fff0d8" />
      <pointLight position={[-6, -3, 4]} intensity={10} color="#f5a81c" distance={18} decay={2} />
      <pointLight position={[6, 4, -8]} intensity={9} color="#3a6fd8" distance={26} decay={2} />
    </>
  );
}
