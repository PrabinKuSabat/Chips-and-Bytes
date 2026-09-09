/**
 * Admin-managed collections must reflect successful mutations immediately.
 * Do not let browsers or shared caches retain deleted or superseded records.
 */
const preventMutableContentCaching = (res) => {
  res.set('Cache-Control', 'no-store');
};

module.exports = { preventMutableContentCaching };
