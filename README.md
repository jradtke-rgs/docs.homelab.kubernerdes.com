# docs.homelab.kubernerdes.com

Documentation site for [homelab.kubernerdes.com](https://github.com/jradtke-rgs/homelab.kubernerdes.com) — a single-codebase deployment framework for building a Kubernetes homelab using SUSE Rancher, Harvester, and related tooling across Community, Carbide, and Enclave environments.

**Live site:** https://jradtke-rgs.github.io/docs.homelab.kubernerdes.com/

---

## Built With

[Docusaurus 3.9.2](https://docusaurus.io)

## Local Development

```bash
npm install
npm start
```

Opens a browser at `http://localhost:3000/docs.homelab.kubernerdes.com/`.

## Build

```bash
npm run build
```

Generates a static site in `build/`.

## Deployment

Pushes to `main` automatically trigger the GitHub Actions workflow (`.github/workflows/deploy.yml`), which builds the site and publishes it to the `gh-pages` branch.
