import AdminJS, { ResourceWithOptions } from "adminjs";
import { DMMFClass } from '@prisma/client/runtime';

import { PrismaService } from "@seedo/server/prisma/prisma.service";

export function sentEmails(prisma: PrismaService): ResourceWithOptions {
  const dmmf = ((prisma as any)._dmmf as DMMFClass)

  return {
    resource: { model: dmmf.modelMap.sentEmails, client: prisma },
    options: {
      actions: {
        show: { component: AdminJS.bundle('../components/ShowEmail') },
        delete: { isVisible: false, isAccessible: false },
        edit: { isVisible: false, isAccessible: false },
        new: { isVisible: false, isAccessible: false }
      }
    }
  }
}