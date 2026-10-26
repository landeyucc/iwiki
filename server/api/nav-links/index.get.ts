import db from '../../utils/db'

export default defineEventHandler(() => {
  const links = db.prepare('SELECT * FROM nav_links ORDER BY order_num ASC, id ASC').all()
  return links
})
