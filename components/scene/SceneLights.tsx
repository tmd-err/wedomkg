export default function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.55} color="#f4efe4" />
      <directionalLight position={[4, 6, 6]} intensity={0.7} color="#fff6e6" />
      <pointLight position={[-6, -3, 4]} intensity={14} color="#f5a81c" distance={18} decay={2} />
      <pointLight position={[6, 4, -4]} intensity={8} color="#3a5f8a" distance={20} decay={2} />
    </>
  );
}
