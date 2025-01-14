import { theme, buttonStyles, layoutStyles } from '../styles/theme';

describe('theme', () => {
  describe('palette', () => {
    it('should have correct mode and colors', () => {
      expect(theme.palette.mode).toBe('dark');
      expect(theme.palette.primary.main).toBe('#00F5A0');
      expect(theme.palette.secondary.main).toBe('#00D9F5');
      expect(theme.palette.background.default).toBe('rgba(16, 20, 24, 0.8)');
      expect(theme.palette.background.paper).toBe('rgba(16, 20, 24, 0.8)');
      expect(theme.palette.text.primary).toBe('#FFFFFF');
      expect(theme.palette.text.secondary).toBe('rgba(255, 255, 255, 0.7)');
    });
  });

  describe('typography', () => {
    it('should have correct font configuration', () => {
      expect(theme.typography.fontFamily).toBe(
        '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
      );
      expect(theme.typography.h4?.fontWeight).toBe(700);
      expect(theme.typography.h4?.letterSpacing).toBe(2);
      expect(theme.typography.h6?.fontWeight).toBe(500);
    });
  });

  describe('components', () => {
    it('should have correct button configuration', () => {
      expect(theme.components?.MuiButton?.styleOverrides?.root?.textTransform).toBe('none');
    });
  });
});

describe('buttonStyles', () => {
  describe('primary button', () => {
    it('should have correct styles', () => {
      expect(buttonStyles.primary.background).toMatch(/linear-gradient/);
      expect(buttonStyles.primary.boxShadow).toBeDefined();
      expect(buttonStyles.primary.fontSize).toBe('1rem');
      expect(buttonStyles.primary.fontWeight).toBe(600);
      expect(buttonStyles.primary.letterSpacing).toBe(1);
      expect(buttonStyles.primary.border).toBe(0);
      expect(buttonStyles.primary['&:hover']).toBeDefined();
      expect(buttonStyles.primary['&.Mui-disabled']).toBeDefined();
    });
  });

  describe('outline button', () => {
    it('should have correct styles', () => {
      expect(buttonStyles.outline.borderColor).toBe('rgba(0, 245, 160, 0.5)');
      expect(buttonStyles.outline.color).toBe('#00F5A0');
      expect(buttonStyles.outline['&:hover']).toBeDefined();
    });
  });
});

describe('layoutStyles', () => {
  describe('flexCenter', () => {
    it('should have correct flex styles', () => {
      expect(layoutStyles.flexCenter.display).toBe('flex');
      expect(layoutStyles.flexCenter.justifyContent).toBe('center');
      expect(layoutStyles.flexCenter.alignItems).toBe('center');
    });
  });

  describe('flexBetween', () => {
    it('should have correct flex styles', () => {
      expect(layoutStyles.flexBetween.display).toBe('flex');
      expect(layoutStyles.flexBetween.justifyContent).toBe('space-between');
      expect(layoutStyles.flexBetween.alignItems).toBe('center');
    });
  });

  describe('mainContainer', () => {
    it('should have correct container styles', () => {
      expect(layoutStyles.mainContainer.minHeight).toBe('100vh');
      expect(layoutStyles.mainContainer.background).toMatch(/linear-gradient/);
      expect(layoutStyles.mainContainer.padding).toBe('2rem');
      expect(layoutStyles.mainContainer.display).toBe('flex');
      expect(layoutStyles.mainContainer.alignItems).toBe('center');
      expect(layoutStyles.mainContainer.position).toBe('relative');
    });
  });

  describe('glassPanel', () => {
    it('should have correct panel styles', () => {
      expect(layoutStyles.glassPanel.background).toBe('rgba(16, 20, 24, 0.8)');
      expect(layoutStyles.glassPanel.backdropFilter).toBe('blur(20px)');
      expect(layoutStyles.glassPanel.color).toBe('#FFFFFF');
      expect(layoutStyles.glassPanel.borderRadius).toBe(4);
      expect(layoutStyles.glassPanel.border).toBe('1px solid rgba(255, 255, 255, 0.1)');
      expect(layoutStyles.glassPanel.boxShadow).toBe('0 8px 32px 0 rgba(0, 0, 0, 0.37)');
      expect(layoutStyles.glassPanel.position).toBe('relative');
      expect(layoutStyles.glassPanel.overflow).toBe('hidden');
      expect(layoutStyles.glassPanel['&::after']).toBeDefined();
    });
  });
});
