import { RouterLinkBuilderPipe } from './router-link-builder.pipe';

describe('RouterLinkBuilderPipe', () => {
  it('create an instance', () => {
    const pipe = new RouterLinkBuilderPipe();
    expect(pipe).toBeTruthy();
  });
});
