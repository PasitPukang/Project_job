async function main() {
  const res = await fetch('http://localhost:5000/api/jobs/employer/23');
  const data = await res.json();
  console.log("API response:", data);
}

main().catch(console.error);
