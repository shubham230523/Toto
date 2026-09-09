import axios from 'axios';

const BACKEND_URL = 'http://localhost:3000';
const CONCEPTS = [
  "Toto finds a colorful flower",
  "Mimi hops over a small stone",
  "Bobo finds some sweet honey",
  "Toto sees a big blue butterfly",
  "Mimi and Toto share a red apple"
];

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('--- Toto Universal Stabilization Loop ---');

  for (const concept of CONCEPTS) {
    let success = false;
    let attempt = 1;

    while (!success) {
      try {
        console.log(`\n[Loop]: Starting episode generation for "${concept}" (Attempt ${attempt})...`);
        const response = await axios.post(`${BACKEND_URL}/content/episodes/generate`, {
          learningConcept: concept
        }, { timeout: 300000 }); // 5 min timeout for the trigger

        const episodeId = response.data.data.episode.id;
        console.log(`[Loop]: Episode ${episodeId} triggered. Waiting for READY status...`);

        // Poll for completion
        let ready = false;
        while (!ready) {
          const statusRes = await axios.get(`${BACKEND_URL}/episodes/${episodeId}`);
          const status = statusRes.data.data.episode.status;

          if (status === 'ready') {
            console.log(`\n[Loop]: SUCCESS! Episode "${concept}" is READY.`);
            ready = true;
            success = true;
          } else if (status === 'failed') {
            console.error(`\n[Loop]: FAILED: Render job for "${concept}" crashed.`);
            ready = true; // Break polling to retry the whole loop
          } else {
            process.stdout.write('.');
            await wait(10000); // Poll every 10s
          }
        }
      } catch (error: any) {
        console.error(`\n[Loop]: Error: ${error.response?.data?.message || error.message}`);
        console.log('[Loop]: Retrying in 15 seconds...');
        await wait(15000);
      }
      attempt++;
    }
  }

  console.log('\n--- ALL EPISODES GENERATED SUCCESSFULLY ---');
}

run();
