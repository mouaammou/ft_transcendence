import asyncio 
import time

#Synchron


def task_sync(x):
    print(f"Task sync: {x} working")
    time.sleep(2)
    print(f"Task sync: {x} done")


task_sync('Ex1')

print('-'*50)


#Asynchron 
async def task_async(x):
    print(f"Task async: {x} working")
    await asyncio.sleep(2)
    print(f"task {x}: done")

#Call task 
tasks = (task_async('Ex2'),
         task_async('Ex3'),
         )

async def main():
    await asyncio.gather(*tasks)
asyncio.run(main())