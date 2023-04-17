import { setChonkyDefaults } from 'chonky';
import { ChonkyIconFA } from 'chonky-icon-fontawesome';
import { FullFileBrowser } from 'chonky';
// Somewhere in your `index.ts`:
setChonkyDefaults({ iconComponent: ChonkyIconFA });

export default function MyFileBrowser() {
    const files = [
        { id: 'lht', name: 'Projects', isDir: true },
        {
          id: 'mcd',
          name: 'chonky-sphere-v2.png',
          thumbnailUrl: 'https://chonky.io/chonky-sphere-v2.png',
        },
      ]
      const folderChain = [{ id: 'xcv', name: 'Demo', isDir: true }]
    return (
        <div>
            <FullFileBrowser files={files} folderChain={folderChain} />
        </div>
    );
};