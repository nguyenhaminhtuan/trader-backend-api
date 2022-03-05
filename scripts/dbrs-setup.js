rs.initiate(
  {
    _id: 'dbrs',
    version: 1,
    members: [
      {
        _id: 1,
        host: '192.168.1.5:27017',
        priority: 3,
      },
      {
        _id: 2,
        host: '192.168.1.5:27018',
        priority: 2,
      },
      {
        _id: 3,
        host: '192.168.1.5:27019',
        priority: 1,
      },
    ],
  },
  {force: true}
)
rs.status()
