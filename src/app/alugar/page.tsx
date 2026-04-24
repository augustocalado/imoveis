import { permanentRedirect } from 'next/navigation';

export default function AlugarRedirect() {
    permanentRedirect('/imoveis?type=aluguel');
}
