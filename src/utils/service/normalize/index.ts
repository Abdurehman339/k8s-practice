class NormalizationService {
  object_exist(payload?: object) {
    if (!payload) return undefined;
    return Object.keys(payload).length > 0 ? payload : undefined;
  }

  array(payload?: any) {
    if (!payload) return [];
  }

  object(payload?: any) {
    if (!payload) return undefined;
    if (typeof payload !== 'object') return undefined;

    return payload && Object.keys(payload).length > 0
      ? Object.entries(payload).map(([key, value]) => ({ key, value }))
      : undefined;
  }
}

const Normalize = new NormalizationService();
Object.freeze(Normalize);

export default Normalize;
