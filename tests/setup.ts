import '@testing-library/jest-dom/vitest';

const modules = import.meta.glob('../src/**/*.ts', { eager: true });
void modules;
