import { act, create } from 'react-test-renderer';
import { Text } from 'react-native';
import { useIsDesktop, useResponsiveWidth } from '../useIsDesktop';

function Probe({ onValue }: { onValue: (value: boolean) => void }) {
  onValue(useIsDesktop());
  return <Text>probe</Text>;
}

describe('useIsDesktop', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders false first, then flips to true only after mount -- never true on the first pass', () => {
    jest.spyOn(require('react-native'), 'useWindowDimensions').mockReturnValue({ width: 1200, height: 900 });
    const values: boolean[] = [];

    // A single act() call flushes the initial render *and* the mount effect
    // that follows it, so `values` captures both passes in order. The first
    // entry is what the static export's pre-rendered HTML corresponds to --
    // it must be false even at a desktop width, or hydration mismatches.
    act(() => {
      create(<Probe onValue={(v) => values.push(v)} />);
    });

    expect(values[0]).toBe(false);
    expect(values.at(-1)).toBe(true);
  });

  it('switches to the real width-derived value once mounted', () => {
    jest.spyOn(require('react-native'), 'useWindowDimensions').mockReturnValue({ width: 1200, height: 900 });
    const values: boolean[] = [];

    act(() => {
      create(<Probe onValue={(v) => values.push(v)} />);
    });

    expect(values.at(-1)).toBe(true);
  });

  it('stays false once mounted at a narrow (mobile) width', () => {
    jest.spyOn(require('react-native'), 'useWindowDimensions').mockReturnValue({ width: 375, height: 812 });
    const values: boolean[] = [];

    act(() => {
      create(<Probe onValue={(v) => values.push(v)} />);
    });

    expect(values.at(-1)).toBe(false);
  });
});

describe('useResponsiveWidth', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('reports 0 on the first pass, then the real width once mounted', () => {
    jest.spyOn(require('react-native'), 'useWindowDimensions').mockReturnValue({ width: 1024, height: 768 });
    const values: number[] = [];

    function WidthProbe() {
      values.push(useResponsiveWidth());
      return <Text>probe</Text>;
    }

    act(() => {
      create(<WidthProbe />);
    });

    expect(values[0]).toBe(0);
    expect(values.at(-1)).toBe(1024);
  });
});
